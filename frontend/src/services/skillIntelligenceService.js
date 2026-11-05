/**
 * SKILL NEXUS AI — Skill Intelligence Fast-Load & Caching Service
 *
 * Implements:
 * 1. Instant Synchronous Cache Retrieval (Stale-While-Revalidate)
 * 2. Parallel Promise.all API Fetching with Deduplication
 * 3. In-flight Request Sharing to prevent duplicate network calls
 * 4. Background prefetching for student dashboard navigation
 */

import { certificateService } from './certificateService';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '') + '/api';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh TTL

// In-memory cache map: studentId -> { timestamp, data }
const memoryCache = new Map();
// Pending promise map for in-flight deduplication: studentId -> Promise
const inFlightRequests = new Map();

function getStorageKey(studentId) {
  return `nexus_skill_intel_${String(studentId || 'default')}`;
}

function getAuthHeaders(explicitToken) {
  const token = explicitToken || localStorage.getItem('nexus_token') || localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const skillIntelligenceService = {
  /**
   * Synchronously retrieve cached data if available.
   * Returns null if no cache is found.
   */
  getCached(studentId) {
    if (!studentId) return null;
    const cleanId = String(studentId).trim();

    // 1. Check memory cache first
    const mem = memoryCache.get(cleanId);
    if (mem && mem.data) {
      return {
        ...mem.data,
        isStale: Date.now() - mem.timestamp > CACHE_TTL_MS
      };
    }

    // 2. Check sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem(getStorageKey(cleanId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.data) {
            memoryCache.set(cleanId, parsed);
            return {
              ...parsed.data,
              isStale: Date.now() - parsed.timestamp > CACHE_TTL_MS
            };
          }
        }
      }
    } catch (e) {
      // Ignore storage errors
    }

    return null;
  },

  /**
   * Set cached data in both memory and sessionStorage.
   */
  setCached(studentId, data) {
    if (!studentId || !data) return;
    const cleanId = String(studentId).trim();
    const entry = { timestamp: Date.now(), data };
    memoryCache.set(cleanId, entry);

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(getStorageKey(cleanId), JSON.stringify(entry));
      }
    } catch (e) {
      // Storage quota or privacy mode
    }
  },

  /**
   * Invalidate cache for a student (e.g., when a skill is added, enrolled, or assessed).
   */
  invalidateCache(studentId) {
    if (!studentId) {
      memoryCache.clear();
      return;
    }
    const cleanId = String(studentId).trim();
    memoryCache.delete(cleanId);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(getStorageKey(cleanId));
      }
    } catch (e) {}
  },

  /**
   * Fetch all Skill Intelligence datasets concurrently in parallel.
   * Deduplicates concurrent calls for the same studentId.
   */
  async fetchAllParallel(studentId, explicitToken = null) {
    const cleanId = String(studentId || '').trim();

    // If already fetching for this student, return existing in-flight promise
    if (inFlightRequests.has(cleanId)) {
      return inFlightRequests.get(cleanId);
    }

    const fetchPromise = (async () => {
      try {
        const headers = getAuthHeaders(explicitToken);

        // Run all 6 independent endpoints in parallel via Promise.all
        const [
          skillsRes,
          readinessRes,
          intelRes,
          publishedRes,
          certsRes,
          gapRes
        ] = await Promise.all([
          // 1. Student Skills Ledger
          fetch(`${API_BASE}/student/skills`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),

          // 2. Authoritative Career Readiness Score
          cleanId
            ? fetch(`${API_BASE}/nexus/readiness/${cleanId}`, { headers })
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
            : Promise.resolve(null),

          // 3. Enrolled Skills Intelligence
          fetch(`${API_BASE}/learning/my-skill-intelligence`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),

          // 4. Published Institutional Catalog
          fetch(`${API_BASE}/learning/skills`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null),

          // 5. Certificates & Credential Registry
          certificateService.getMyCertificates().catch(() => ({ success: false, data: [] })),

          // 6. AI Skill Gap Matrix
          certificateService.getSkillGapIntelligence().catch(() => ({ success: false, data: null }))
        ]);

        const result = {
          skillsData: skillsRes?.success && Array.isArray(skillsRes.data) ? skillsRes.data : null,
          readinessData: readinessRes?.success ? readinessRes.data : null,
          enrolledSkills: intelRes?.success && Array.isArray(intelRes.data) ? intelRes.data : [],
          publishedSkills: publishedRes?.success && Array.isArray(publishedRes.data) ? publishedRes.data : [],
          certificates: certsRes?.success && Array.isArray(certsRes.data) ? certsRes.data : [],
          skillGapData: gapRes?.success && gapRes.data ? gapRes.data : null
        };

        if (cleanId) {
          this.setCached(cleanId, result);
        }

        return result;
      } finally {
        inFlightRequests.delete(cleanId);
      }
    })();

    inFlightRequests.set(cleanId, fetchPromise);
    return fetchPromise;
  },

  /**
   * Pre-warm the cache in the background during idle time (e.g. from StudentDashboard).
   * Does not throw or block the main thread.
   */
  prefetch(studentId, explicitToken = null) {
    if (!studentId) return;
    const cleanId = String(studentId).trim();
    const cached = this.getCached(cleanId);
    if (cached && !cached.isStale) return; // Already fresh in cache

    // Use requestIdleCallback if available, or setTimeout
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.fetchAllParallel(cleanId, explicitToken).catch(() => {});
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        this.fetchAllParallel(cleanId, explicitToken).catch(() => {});
      }, 500);
    }
  }
};

