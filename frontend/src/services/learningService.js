/**
 * SKILL NEXUS AI — Student Learning & Skill Lifecycle Service
 * Provides student-facing endpoints for:
 * - Skill discovery and eligibility breakdown
 * - Open enrollment & approval requests
 * - Progress tracking & proctored assessment submissions
 * - My Skills & credential retrieval
 */

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('nexus_token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const learningService = {
  // Discover skills with student eligibility status attached
  async getSkills() {
    const res = await fetch(`${API_BASE}/learning/skills`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // Get single skill details with eligibility breakdown
  async getSkill(skillId) {
    const res = await fetch(`${API_BASE}/learning/skills/${encodeURIComponent(skillId)}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  },

  // Enroll in skill (Open Enrollment or Request Approval)
  async enroll(skillId, options = {}) {
    const res = await fetch(`${API_BASE}/learning/skills/${encodeURIComponent(skillId)}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(options)
    });
    return await res.json();
  },

  // Submit proctored assessment
  async submitAssessment(skillId, submissionData) {
    const res = await fetch(`${API_BASE}/learning/skills/${encodeURIComponent(skillId)}/assess`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(submissionData)
    });
    return await res.json();
  },

  // Get enrolled skills and certificates for active student
  async getMySkills() {
    const res = await fetch(`${API_BASE}/learning/my-skills`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }
};
