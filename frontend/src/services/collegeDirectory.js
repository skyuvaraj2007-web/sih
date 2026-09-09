/**
 * SKILLNEXUS AI — Complete Tamil Nadu College Master Directory Service
 * Single source of truth for higher-education institution identity in Tamil Nadu.
 * Built from authoritative sources: Tamil Nadu DCE, UGC, AICTE, and Anna University/TNEA.
 * 
 * Includes configurable SKILLNEXUS Tier 1, Tier 2, Tier 3, Tier 4 classifications
 * (clearly presented as a Career Intelligence / Product classification, NOT official government ranking).
 */

import { getAllRelationalInstitutions, getRelationalInstitutionById, SEED_INSTITUTIONS } from './nexusDataStore.js';

export const TN_COLLEGES = SEED_INSTITUTIONS;

/**
 * High-performance search against the master directory with prioritized ranking:
 * 1. Exact official name match (Score: 100)
 * 2. Starts-with name match (Score: 80)
 * 3. Exact/partial alias match (Score: 75)
 * 4. Partial name match (Score: 60)
 * 5. City / District match (Score: 50)
 * 6. Search keyword match (Score: 30)
 * 
 * Only active institutions are returned by default for registration.
 */
export function searchColleges(query, limit = 10, includeInactive = false) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const q = query.trim().toLowerCase();

  const scored = [];

  for (let i = 0; i < TN_COLLEGES.length; i++) {
    const col = TN_COLLEGES[i];

    // Filter inactive unless explicitly requested
    if (!includeInactive && col.activeStatus !== 'ACTIVE') {
      continue;
    }

    const name = col.collegeName.toLowerCase();
    const official = (col.officialName || '').toLowerCase();
    const short = (col.shortName || '').toLowerCase();
    const city = (col.city || '').toLowerCase();
    const district = (col.district || '').toLowerCase();
    const code = col.collegeId.toLowerCase();
    const keywords = col.searchKeywords || '';

    let score = 0;

    // 1. Exact Name / ShortName / Code Match
    if (name === q || official === q || short === q || code === q) {
      score = 100;
    }
    // 2. Exact Alias Match (e.g. 'SRM', 'PSG', 'SSN', 'VIT')
    else if (col.aliases && col.aliases.some(a => a.toLowerCase() === q)) {
      score = 95;
    }
    // 3. Starts-with match on official title / short name
    else if (name.startsWith(q) || short.startsWith(q) || official.startsWith(q)) {
      score = 80;
    }
    // 4. Starts-with alias match
    else if (col.aliases && col.aliases.some(a => a.toLowerCase().startsWith(q))) {
      score = 75;
    }
    // 5. Partial Name match
    else if (name.includes(q) || official.includes(q)) {
      score = 60;
    }
    // 6. City / District match
    else if (city === q || district === q) {
      score = 55;
    } else if (city.startsWith(q) || district.startsWith(q)) {
      score = 50;
    } else if (city.includes(q) || district.includes(q)) {
      score = 45;
    }
    // 7. Search Keyword match
    else if (keywords.includes(q)) {
      score = 30;
    }

    if (score > 0) {
      // Small tie-breaker based on institutional standing (0-10 pts)
      const tieBreaker = (col.tierScore || 0) * 0.1;
      scored.push({ college: col, score: score + tieBreaker });
    }
  }

  // Sort descending by score, then alphabetically
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.college.collegeName.localeCompare(b.college.collegeName);
  });

  return scored.slice(0, limit).map(item => item.college);
}

/**
 * Direct lookup by unique collegeId.
 */
export function getCollegeById(collegeId) {
  if (!collegeId) return null;
  const found = getRelationalInstitutionById(collegeId);
  if (found) return found;
  const target = collegeId.trim().toUpperCase();
  const all = getAllRelationalInstitutions();
  return all.find(c => (c.collegeId || c.institutionId || '').toUpperCase() === target) || null;
}

/**
 * Lookup by exact college name or alias (case-insensitive).
 */
export function getCollegeByName(name) {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  return TN_COLLEGES.find(c =>
    c.collegeName.toLowerCase() === n ||
    c.officialName.toLowerCase() === n ||
    (c.aliases && c.aliases.some(a => a.toLowerCase() === n))
  ) || null;
}

/**
 * Filter directory by multiple criteria for administrative inspection or directory views.
 */
export function filterDirectory({
  district = 'ALL',
  institutionType = 'ALL',
  tier = 'ALL',
  ownershipType = 'ALL',
  activeStatus = 'ALL',
  search = ''
}) {
  let list = TN_COLLEGES;

  if (district !== 'ALL') {
    list = list.filter(c => c.district.toLowerCase() === district.toLowerCase());
  }
  if (institutionType !== 'ALL') {
    list = list.filter(c => c.institutionType.toLowerCase() === institutionType.toLowerCase());
  }
  if (tier !== 'ALL') {
    list = list.filter(c => c.tier === tier);
  }
  if (ownershipType !== 'ALL') {
    list = list.filter(c => c.ownershipType === ownershipType);
  }
  if (activeStatus !== 'ALL') {
    list = list.filter(c => c.activeStatus === activeStatus);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(c =>
      c.collegeName.toLowerCase().includes(q) ||
      c.collegeId.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.district && c.district.toLowerCase().includes(q))
    );
  }

  return list;
}

/**
 * Directory Metadata & Tier Breakdown Statistics
 */
export function getDirectoryStats() {
  const stats = {
    total: TN_COLLEGES.length,
    active: 0,
    inactive: 0,
    districtsCount: 0,
    tiers: {
      'SKILLNEXUS Tier 1': 0,
      'SKILLNEXUS Tier 2': 0,
      'SKILLNEXUS Tier 3': 0,
      'SKILLNEXUS Tier 4': 0,
      'Unclassified': 0
    },
    ownerships: {},
    sources: [
      'Tamil Nadu Directorate of Collegiate Education (DCE)',
      'University Grants Commission (UGC)',
      'Anna University / TNEA',
      'Ministry of Education / NIRF',
      'National Medical Commission (NMC)'
    ]
  };

  const districtSet = new Set();

  TN_COLLEGES.forEach(c => {
    if (c.activeStatus === 'ACTIVE') stats.active++;
    else stats.inactive++;

    if (c.district) districtSet.add(c.district);

    if (stats.tiers[c.tier] !== undefined) {
      stats.tiers[c.tier]++;
    } else {
      stats.tiers['Unclassified']++;
    }

    const own = c.ownershipType || 'Other';
    stats.ownerships[own] = (stats.ownerships[own] || 0) + 1;
  });

  stats.districtsCount = districtSet.size;
  return stats;
}

/**
 * Unique list of all 38 Tamil Nadu districts.
 */
export function getAllDistricts() {
  const set = new Set();
  TN_COLLEGES.forEach(c => {
    if (c.district) set.add(c.district);
  });
  return Array.from(set).sort();
}

/**
 * Unique list of institution types.
 */
export function getAllInstitutionTypes() {
  const set = new Set();
  TN_COLLEGES.forEach(c => {
    if (c.institutionType) set.add(c.institutionType);
  });
  return Array.from(set).sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE CATALOG (Learning Page)
// Each institution shares the NEXUS platform catalog; additionally they may
// have institution-specific tracks. For now we use a shared + college-id-based
// set of courses to power the Course Catalog tab.
// ─────────────────────────────────────────────────────────────────────────────

const NEXUS_CATALOG = [
  // ── Shared Platform Courses ─────────────────────────────────────────────────
  { courseId: 'COURSE-001', title: 'Python for Data Science', category: 'DATA & AI', level: 'Beginner → Intermediate', durationWeeks: 8, totalModules: 24, module1: 'Variables & Types', color: '#28D7FF', tags: ['Python', 'Pandas', 'NumPy', 'Visualization'], collegeIds: null },
  { courseId: 'COURSE-002', title: 'Generative AI Fundamentals', category: 'BY NEXUS AI', level: 'Intermediate', durationWeeks: 6, totalModules: 12, module1: 'Transformers Basics', color: '#8B5CF6', tags: ['LLMs', 'Prompting', 'RAG', 'Vector DBs'], collegeIds: null },
  { courseId: 'COURSE-003', title: 'Advanced SQL for Data Engineering', category: 'DATABASE', level: 'Advanced', durationWeeks: 4, totalModules: 13, module1: 'Relational Model', color: '#2FE0A1', tags: ['SQL', 'Indexing', 'CTEs', 'Partitioning'], collegeIds: null },
  { courseId: 'COURSE-004', title: 'Data Analytics Foundations', category: 'ANALYTICS', level: 'Beginner', durationWeeks: 5, totalModules: 12, module1: 'Intro to Analytics', color: '#3478FF', tags: ['Excel', 'Tableau', 'Statistics'], collegeIds: null },
  { courseId: 'COURSE-005', title: 'Machine Learning with Scikit-Learn', category: 'ML', level: 'Intermediate', durationWeeks: 7, totalModules: 18, module1: 'Supervised Learning', color: '#F59E0B', tags: ['ML', 'Scikit-Learn', 'Classification', 'Regression'], collegeIds: null },
  { courseId: 'COURSE-006', title: 'Deep Learning & Neural Networks', category: 'DEEP LEARNING', level: 'Advanced', durationWeeks: 8, totalModules: 20, module1: 'Perceptrons & Activations', color: '#EC4899', tags: ['PyTorch', 'CNN', 'RNN', 'Transformers'], collegeIds: null },
  { courseId: 'COURSE-007', title: 'Web Development with React 18', category: 'WEB DEV', level: 'Intermediate', durationWeeks: 6, totalModules: 15, module1: 'JSX & Components', color: '#06B6D4', tags: ['React', 'Hooks', 'State', 'API'], collegeIds: null },
  { courseId: 'COURSE-008', title: 'Cloud & DevOps Essentials', category: 'CLOUD', level: 'Intermediate', durationWeeks: 5, totalModules: 14, module1: 'Cloud Fundamentals', color: '#6366F1', tags: ['AWS', 'Docker', 'CI/CD', 'Kubernetes'], collegeIds: null },
  { courseId: 'COURSE-009', title: 'Cybersecurity Fundamentals', category: 'SECURITY', level: 'Beginner → Intermediate', durationWeeks: 6, totalModules: 16, module1: 'Threat Landscape', color: '#10B981', tags: ['Security', 'OWASP', 'Cryptography', 'Networking'], collegeIds: null },
  { courseId: 'COURSE-010', title: 'Logical Reasoning & Aptitude Mastery', category: 'APTITUDE', level: 'All Levels', durationWeeks: 4, totalModules: 10, module1: 'Number Systems', color: '#F97316', tags: ['Reasoning', 'Aptitude', 'Placement Prep'], collegeIds: null },
  { courseId: 'COURSE-011', title: 'NLP & Text Analytics', category: 'NLP', level: 'Advanced', durationWeeks: 6, totalModules: 16, module1: 'Tokenization & Embeddings', color: '#A78BFA', tags: ['NLTK', 'spaCy', 'BERT', 'Sentiment'], collegeIds: null },
  { courseId: 'COURSE-012', title: 'IoT & Embedded Systems', category: 'IOT', level: 'Intermediate', durationWeeks: 5, totalModules: 14, module1: 'Microcontroller Basics', color: '#34D399', tags: ['Arduino', 'Raspberry Pi', 'MQTT', 'Sensors'], collegeIds: null },
  { courseId: 'COURSE-013', title: 'Full Stack Java Development', category: 'JAVA', level: 'Intermediate', durationWeeks: 8, totalModules: 20, module1: 'Java OOP Basics', color: '#FB923C', tags: ['Java', 'Spring Boot', 'Hibernate', 'REST'], collegeIds: null },
  { courseId: 'COURSE-014', title: 'System Design & Architecture', category: 'SYSTEMS', level: 'Advanced', durationWeeks: 5, totalModules: 12, module1: 'Scalability Principles', color: '#818CF8', tags: ['HLD', 'LLD', 'Microservices', 'CAP'], collegeIds: null },
  { courseId: 'COURSE-015', title: 'Blockchain & Web3 Fundamentals', category: 'BLOCKCHAIN', level: 'Beginner → Intermediate', durationWeeks: 5, totalModules: 12, module1: 'Distributed Ledger Basics', color: '#F472B6', tags: ['Ethereum', 'Solidity', 'DeFi', 'Smart Contracts'], collegeIds: null },
];

/**
 * Return courses available to a student at a given institution.
 * All NEXUS platform courses (collegeIds: null) are always shown.
 * Any institution-specific courses (collegeIds: [id,...]) are shown only if matched.
 */
export function getCoursesByCollegeId(collegeId) {
  return NEXUS_CATALOG.filter(c =>
    c.collegeIds === null ||
    (Array.isArray(c.collegeIds) && c.collegeIds.includes(collegeId))
  );
}
