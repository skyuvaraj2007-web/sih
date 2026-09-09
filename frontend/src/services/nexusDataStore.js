/**
 * SKILLNEXUS AI — Centralized Relational Data Store & Matching Engine
 * Phase 2 Core: Single Source of Truth linking Students ↔ Institutions ↔ Companies
 *
 * Entities:
 * - Students
 * - Institutions
 * - Companies
 * - Courses
 * - Enrollments
 * - Projects & Proofs
 * - Company Opportunities
 * - Applications
 *
 * Provides:
 * - Deterministic NEXUS AI Explainable Matching Algorithm
 * - Skill Growth Evidence Aggregator
 * - Reactive LocalStorage State Sync with Cross-Tab & Cross-Portal CustomEvents
 */

import { addRoleNotification } from './notificationStore';
import { nexusApiClient } from './nexusApiClient';

// LocalStorage Keys
const KEYS = {
  STUDENTS: 'nexus_relational_students',
  INSTITUTIONS: 'nexus_relational_institutions',
  COMPANIES: 'nexus_relational_companies',
  COURSES: 'nexus_relational_courses',
  ENROLLMENTS: 'nexus_relational_enrollments',
  PROJECTS: 'nexus_relational_projects',
  OPPORTUNITIES: 'nexus_relational_opportunities',
  APPLICATIONS: 'nexus_relational_applications'
};

/**
 * Asynchronous Background Database Hydrator
 * Fetches fresh relational data from PostgreSQL / Supabase backend
 * and synchronizes with reactive local state cache.
 */
export async function syncWithBackendDatabase() {
  try {
    const [students, courses, enrollments, projects, opportunities, applications] = await Promise.all([
      nexusApiClient.getStudents(),
      nexusApiClient.getCourses(),
      nexusApiClient.getEnrollments(),
      nexusApiClient.getProjects(),
      nexusApiClient.getOpportunities(),
      nexusApiClient.getApplications()
    ]);

    if (students && students.length > 0) {
      writeStorage(KEYS.STUDENTS, students, 'nexus_students_updated');
    }
    if (courses && courses.length > 0) {
      writeStorage(KEYS.COURSES, courses, 'nexus_courses_updated');
    }
    if (enrollments && enrollments.length > 0) {
      writeStorage(KEYS.ENROLLMENTS, enrollments, 'nexus_enrollments_updated');
    }
    if (projects && projects.length > 0) {
      writeStorage(KEYS.PROJECTS, projects, 'nexus_projects_updated');
    }
    if (opportunities && opportunities.length > 0) {
      writeStorage(KEYS.OPPORTUNITIES, opportunities, 'nexus_opportunities_updated');
    }
    if (applications && applications.length > 0) {
      writeStorage(KEYS.APPLICATIONS, applications, 'nexus_applications_updated');
    }
  } catch (err) {
    console.debug('Backend sync deferred (offline or dev fallback):', err.message);
  }
}

// Automatically trigger background synchronization once window loads
if (typeof window !== 'undefined') {
  setTimeout(syncWithBackendDatabase, 800);
}

// ══════════════════════════════════════════════════════════════════════════
// 1. SEED DATA
// ══════════════════════════════════════════════════════════════════════════

export const SEED_INSTITUTIONS = [
  {
    institutionId: 'TN010',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    shortName: 'SRM IST',
    collegeCode: 'SRM-KTR-01',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    city: 'Kattankulathur',
    campusType: 'Deemed University',
    departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'EEE', 'Mechanical'],
    studentCount: 6400,
    placementRate: '96.5%',
    dean: 'Prof. K. Ramanathan',
    email: 'placements@srmist.edu.in',
    website: 'https://www.srmist.edu.in',
    tier: 'Tier 1 Partner',
    nirf: '#28 Ranked',
    naac: 'A++ Grade'
  },
  {
    institutionId: 'TN001',
    collegeId: 'TN001',
    collegeName: 'Anna University (CEG Campus)',
    shortName: 'Anna University',
    collegeCode: 'AU-CEG-01',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    campusType: 'State University',
    departments: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'],
    studentCount: 2150,
    placementRate: '96.8%',
    dean: 'Dr. M. Shanmugam',
    email: 'tpo@annauniv.edu',
    website: 'https://www.annauniv.edu',
    tier: 'Tier 1 Partner',
    nirf: '#13 Ranked',
    naac: 'A++ Grade'
  },
  {
    institutionId: 'TN030',
    collegeId: 'TN030',
    collegeName: 'PSG College of Technology',
    shortName: 'PSG Tech',
    collegeCode: 'PSG-CBE-01',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    campusType: 'Autonomous',
    departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'Robotics'],
    studentCount: 4200,
    placementRate: '98.1%',
    dean: 'Dr. V. Radhakrishnan',
    email: 'placement@psgtech.edu',
    website: 'https://www.psgtech.edu',
    tier: 'Tier 1 Partner',
    nirf: '#53 Ranked',
    naac: 'A++ Grade'
  },
  {
    institutionId: 'TN040',
    collegeId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    shortName: 'VCET',
    collegeCode: 'VCET-ERD-01',
    state: 'Tamil Nadu',
    district: 'Erode',
    city: 'Erode',
    campusType: 'Autonomous',
    departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'EEE', 'Mechanical', 'Civil'],
    studentCount: 3850,
    placementRate: '94.2%',
    dean: 'Dr. M. Jayaraman',
    email: 'principal@velalarengg.ac.in',
    website: 'https://velalarengg.ac.in',
    tier: 'Strategic Campus Partner',
    nirf: '#84 Ranked',
    naac: 'A+ Grade'
  },
  {
    institutionId: 'TN050',
    collegeId: 'TN050',
    collegeName: 'Sri Krishna College of Engineering and Technology',
    shortName: 'SKCET',
    collegeCode: 'SKCET-CBE-02',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    campusType: 'Autonomous',
    departments: ['CSE', 'IT', 'AI & DS', 'ECE', 'EEE'],
    studentCount: 3600,
    placementRate: '93.5%',
    dean: 'Dr. J. Janet',
    email: 'info@skcet.ac.in',
    website: 'https://www.skcet.ac.in',
    tier: 'Tier 1 Partner',
    nirf: '#77 Ranked',
    naac: 'A Grade'
  },
  {
    institutionId: 'TN060',
    collegeId: 'TN060',
    collegeName: 'Kongu Engineering College',
    shortName: 'Kongu',
    collegeCode: 'KEC-PER-01',
    state: 'Tamil Nadu',
    district: 'Erode',
    city: 'Perundurai',
    campusType: 'Autonomous',
    departments: ['CSE', 'IT', 'AI & DS', 'Mechanical', 'Chemical'],
    studentCount: 4100,
    placementRate: '92.8%',
    dean: 'Dr. V. Balusamy',
    email: 'principal@kongu.ac.in',
    website: 'https://www.kongu.ac.in',
    tier: 'Strategic Partner',
    nirf: '#99 Ranked',
    naac: 'A++ Grade'
  },
  {
    institutionId: 'TN070',
    collegeId: 'TN070',
    collegeName: 'KSG Institute of Technology',
    shortName: 'KSG',
    collegeCode: 'KSG-CBE-03',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    city: 'Coimbatore',
    campusType: 'Affiliated',
    departments: ['CSE', 'ECE', 'Civil'],
    studentCount: 2200,
    placementRate: '88.4%',
    dean: 'Dr. R. Nandagopal',
    email: 'contact@ksg.edu.in',
    website: 'https://www.ksg.edu.in',
    tier: 'Emerging Partner',
    nirf: '#142 Ranked',
    naac: 'A Grade'
  },
  {
    institutionId: 'TN-UNIV-0001',
    collegeId: 'TN-UNIV-0001',
    collegeName: 'Indian Institute of Technology Madras',
    shortName: 'IIT Madras',
    collegeCode: 'IITM-CHE-01',
    state: 'Tamil Nadu',
    district: 'Chennai',
    city: 'Chennai',
    campusType: 'Institute of National Importance',
    departments: ['CSE', 'EE', 'Data Science', 'Mechanical', 'Aerospace'],
    studentCount: 9500,
    placementRate: '98.9%',
    dean: 'Prof. V. Kamakoti',
    email: 'placement@iitm.ac.in',
    website: 'https://www.iitm.ac.in',
    tier: 'Tier 1 Partner',
    nirf: '#1 Ranked',
    naac: 'A++ Grade'
  }
];

export function getAllRelationalInstitutions() {
  return readStorage(KEYS.INSTITUTIONS, SEED_INSTITUTIONS);
}

export function getRelationalInstitutionById(instId) {
  if (!instId) return null;
  const cleanId = String(instId).toUpperCase().trim();
  return getAllRelationalInstitutions().find(inst => {
    const id = String(inst.institutionId || inst.collegeId || '').toUpperCase().trim();
    const code = String(inst.collegeCode || '').toUpperCase().trim();
    const name = String(inst.collegeName || '').toUpperCase().trim();
    return id === cleanId || code === cleanId || name === cleanId ||
      (cleanId === 'TN010' && (id === 'SRM001' || id === 'TN-010')) ||
      (cleanId === 'SRM001' && id === 'TN010');
  }) || null;
}

export const SEED_STUDENTS = [
  {
    studentId: 'STU-TN010-001',
    regNo: 'RA2211003010001',
    name: 'Arun Kumar',
    email: 'arun.kumar@nexus.edu',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'CSE',
    year: 'III Year',
    semester: 'Sem 6',
    cgpa: '8.92',
    backlogs: 0,
    headline: 'B.Tech CSE • Aspiring Data Scientist & AI Systems Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    readinessScore: 92,
    placementStatus: 'Placement Ready',
    preferredRoles: ['Data Scientist', 'AI/ML Engineer', 'Full Stack Developer'],
    skills: [
      { name: 'Python', level: 'Advanced', confidence: 94, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'SQL', level: 'Advanced', confidence: 88, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'React', level: 'Intermediate', confidence: 82, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: false },
      { name: 'Machine Learning', level: 'Advanced', confidence: 87, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'FastAPI', level: 'Intermediate', confidence: 78, verified: true, hasAssessment: false, hasCourse: true, hasProject: true, hasInstSeal: false },
      { name: 'Docker', level: 'Beginner', confidence: 58, verified: false, hasAssessment: false, hasCourse: false, hasProject: true, hasInstSeal: false },
      { name: 'Power BI', level: 'Beginner', confidence: 35, verified: false, hasAssessment: false, hasCourse: false, hasProject: false, hasInstSeal: false }
    ],
    assessments: [
      { domain: 'Programming & Data Structures', score: 92, percentile: '94th Percentile', status: 'Verified' },
      { domain: 'Logical & Algorithmic Reasoning', score: 88, percentile: '91st Percentile', status: 'Verified' },
      { domain: 'Quantitative Aptitude', score: 84, percentile: '88th Percentile', status: 'Verified' }
    ],
    badges: ['Code Master Gold', 'Algorithmic Thinker', '100 Days of Code', 'AI Scholar'],
    certifications: [
      { title: 'Cryptographic Python Specialist', issuer: 'SRM Center of Excellence', date: '2026-06-12', credentialId: 'NX-3801-PY' },
      { title: 'Full Stack Web Architecture', issuer: 'Nexus AI Academy', date: '2026-07-20', credentialId: 'NX-9102-REACT' }
    ],
    registeredAt: '2025-08-12T10:30:00Z'
  },
  {
    studentId: 'STU-TN010-002',
    regNo: 'RA2211003010045',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'ECE',
    year: 'II Year',
    semester: 'Sem 4',
    cgpa: '8.45',
    backlogs: 0,
    headline: 'Embedded Systems & IoT Firmware Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    readinessScore: 88,
    placementStatus: 'In Process',
    preferredRoles: ['Embedded Systems Engineer', 'IoT Firmware Developer'],
    skills: [
      { name: 'C++', level: 'Advanced', confidence: 86, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'Embedded Systems', level: 'Advanced', confidence: 84, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'IoT', level: 'Intermediate', confidence: 76, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: false },
      { name: 'Python', level: 'Intermediate', confidence: 68, verified: false, hasAssessment: true, hasCourse: false, hasProject: false, hasInstSeal: false }
    ],
    assessments: [
      { domain: 'Logical Reasoning', score: 80, percentile: '82nd Percentile', status: 'Verified' },
      { domain: 'Aptitude', score: 78, percentile: '79th Percentile', status: 'Verified' },
      { domain: 'Programming (C/C++)', score: 86, percentile: '89th Percentile', status: 'Verified' }
    ],
    badges: ['Hardware Hacker', 'Circuit Champion'],
    certifications: [
      { title: 'Embedded Systems Attestation', issuer: 'Bosch Engineering Lab', date: '2026-05-18', credentialId: 'NX-8838-EMB' }
    ],
    registeredAt: '2025-09-01T14:15:00Z'
  },
  {
    studentId: 'STU-TN010-003',
    regNo: 'RA2111003010112',
    name: 'Rahul Krishnan',
    email: 'rahul.k@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'IT',
    year: 'IV Year',
    semester: 'Sem 8',
    cgpa: '9.35',
    backlogs: 0,
    headline: 'Cloud Architect & Microservices Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    readinessScore: 94,
    placementStatus: 'Placed',
    preferredRoles: ['Cloud Architect', 'Backend SDE', 'DevOps Specialist'],
    skills: [
      { name: 'Java', level: 'Advanced', confidence: 94, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'Spring Boot', level: 'Advanced', confidence: 92, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'Kubernetes', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'AWS', level: 'Advanced', confidence: 88, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true }
    ],
    assessments: [
      { domain: 'Logical Reasoning', score: 94, percentile: '96th Percentile', status: 'Verified' },
      { domain: 'Programming (Java/Cloud)', score: 96, percentile: '98th Percentile', status: 'Verified' }
    ],
    badges: ['Cloud Titan', 'System Architect Elite'],
    certifications: [
      { title: 'AWS Certified Solutions Architect', issuer: 'AWS Training & Certification', date: '2026-03-10', credentialId: 'AWS-SOL-8912' }
    ],
    registeredAt: '2025-06-20T09:00:00Z'
  },
  {
    studentId: 'STU-TN010-004',
    regNo: 'RA2211003010204',
    name: 'Deepika Raman',
    email: 'deepika.r@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'AI & DS',
    year: 'III Year',
    semester: 'Sem 6',
    cgpa: '9.18',
    backlogs: 0,
    headline: 'Deep Learning & NLP Research Specialist',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    readinessScore: 91,
    placementStatus: 'Placement Ready',
    preferredRoles: ['Generative AI Engineer', 'NLP Specialist', 'Data Scientist'],
    skills: [
      { name: 'Python', level: 'Advanced', confidence: 95, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'PyTorch', level: 'Advanced', confidence: 94, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'LangChain', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'Vector DBs', level: 'Intermediate', confidence: 85, verified: true, hasAssessment: false, hasCourse: true, hasProject: true, hasInstSeal: false }
    ],
    assessments: [
      { domain: 'Machine Learning & Deep Learning', score: 94, percentile: '95th Percentile', status: 'Verified' },
      { domain: 'Logical Reasoning', score: 91, percentile: '92nd Percentile', status: 'Verified' }
    ],
    badges: ['AI Pioneer', 'Prompt Master'],
    certifications: [
      { title: 'Generative AI Specialist Attestation', issuer: 'IITM Research Park', date: '2026-08-10', credentialId: 'IITM-GENAI-8839' }
    ],
    registeredAt: '2025-08-25T11:45:00Z'
  },
  {
    studentId: 'STU-TN001-001',
    regNo: '2022101001',
    name: 'Siddharth M',
    email: 'siddharth.m@annauniv.edu',
    collegeId: 'TN001',
    collegeName: 'Anna University (CEG Campus)',
    department: 'CSE',
    year: 'III Year',
    semester: 'Sem 6',
    cgpa: '9.40',
    backlogs: 0,
    headline: 'Systems Programming & Linux Kernel Specialist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    readinessScore: 93,
    placementStatus: 'Placement Ready',
    preferredRoles: ['Systems Engineer', 'Rust Developer', 'Kernel Engineer'],
    skills: [
      { name: 'Rust', level: 'Advanced', confidence: 94, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'C', level: 'Advanced', confidence: 92, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true },
      { name: 'Linux Kernel', level: 'Advanced', confidence: 88, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, hasInstSeal: true }
    ],
    assessments: [
      { domain: 'Low-level Systems Programming', score: 95, percentile: '99th Percentile', status: 'Verified' }
    ],
    badges: ['Kernel Hacker', 'Rustacean Pro'],
    certifications: [],
    registeredAt: '2025-08-18T12:00:00Z'
  }
];

export const SEED_COURSES = [
  {
    courseId: 'CRS-TN010-01',
    institutionId: 'TN010',
    courseName: 'Python for Data Science & Machine Learning',
    courseCode: 'CSE-DS-301',
    category: 'DATA & AI',
    description: 'Master foundational Python, NumPy, Pandas, Data Wrangling, Scikit-Learn pipelines, and Model Evaluation.',
    duration: '8 Weeks',
    durationWeeks: 8,
    instructor: 'Dr. S. Kulanthaivel, Dept of CSE',
    skillsDeveloped: ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning'],
    difficulty: 'Beginner → Intermediate',
    prerequisites: 'Basic Programming Literacy',
    modules: [
      'Variables, Data Types & Control Flow',
      'Data Structures & Functional Idioms in Python',
      'Vectorized Computation with NumPy',
      'Data Wrangling & Cleaning with Pandas',
      'Exploratory Data Analysis & Visualization',
      'Supervised Learning with Scikit-Learn',
      'Model Tuning, Cross-Validation & ROC-AUC',
      'Capstone Project & Verifiable Attestation'
    ],
    assessment: 'Midterm Quiz + Final Capstone Project Repository',
    certificate: 'Verifiable W3C Digital Credential',
    enrollmentStatus: 'Open for Enrollment',
    enrolledCount: 24,
    tags: ['Python', 'Pandas', 'Machine Learning', 'Data Analysis']
  },
  {
    courseId: 'CRS-TN010-02',
    institutionId: 'TN010',
    courseName: 'Generative AI & LLM Engineering',
    courseCode: 'AI-GEN-402',
    category: 'BY NEXUS AI',
    description: 'Architecting RAG pipelines, Vector Embeddings, Transformer architectures, and Fine-Tuning with LangChain & PyTorch.',
    duration: '6 Weeks',
    durationWeeks: 6,
    instructor: 'Prof. R. Revathi, Lead AI Lab',
    skillsDeveloped: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Machine Learning'],
    difficulty: 'Intermediate → Advanced',
    prerequisites: 'Python Proficiency, Linear Algebra',
    modules: [
      'Transformer Architecture & Self-Attention',
      'Vector Embeddings & Semantic Similarity',
      'RAG Pipelines with ChromaDB & LangChain',
      'Prompt Engineering & Structured Extraction',
      'Quantization, LoRA & Parameter-Efficient Fine-Tuning',
      'Production Deployment with vLLM & FastAPI'
    ],
    assessment: 'Live Agent Evaluation Sandbox',
    certificate: 'NEXUS Sovereign AI Certificate',
    enrollmentStatus: 'Open for Enrollment',
    enrolledCount: 18,
    tags: ['Generative AI', 'PyTorch', 'LangChain', 'FastAPI']
  },
  {
    courseId: 'CRS-TN010-03',
    institutionId: 'TN010',
    courseName: 'Cloud-Native Microservices & Kubernetes',
    courseCode: 'IT-CLOUD-305',
    category: 'CLOUD',
    description: 'Build enterprise-grade microservices with Docker, Kubernetes orchestration, Helm, and CI/CD pipelines.',
    duration: '6 Weeks',
    durationWeeks: 6,
    instructor: 'Dr. G. Natarajan, Dept of IT',
    skillsDeveloped: ['Docker', 'Kubernetes', 'AWS', 'Linux'],
    difficulty: 'Intermediate',
    prerequisites: 'Basic Linux, Web Fundamentals',
    modules: [
      'Containerization Fundamentals with Docker',
      'Multi-Stage Dockerfile Optimization',
      'Kubernetes Architecture (Pods, Deployments, Services)',
      'Ingress Controllers & Service Meshes',
      'CI/CD Pipelines with GitHub Actions',
      'Observability with Prometheus & Grafana'
    ],
    assessment: 'Live Kubernetes Cluster Deployment',
    certificate: 'Cloud-Native Engineering Credential',
    enrollmentStatus: 'Open for Enrollment',
    enrolledCount: 32,
    tags: ['Docker', 'Kubernetes', 'DevOps', 'AWS']
  }
];

export const SEED_ENROLLMENTS = [
  {
    enrollmentId: 'ENR-01',
    studentId: 'STU-TN010-001',
    courseId: 'CRS-TN010-01',
    courseTitle: 'Python for Data Science & Machine Learning',
    category: 'DATA & AI',
    institutionId: 'TN010',
    progress: 75,
    completedModules: 6,
    totalModules: 8,
    hoursRemaining: 6,
    currentModule: 'Module 7: Model Tuning & Evaluation',
    status: 'active',
    enrolledAt: '2026-08-01T10:00:00Z',
    assessmentScore: '88%'
  },
  {
    enrollmentId: 'ENR-02',
    studentId: 'STU-TN010-001',
    courseId: 'CRS-TN010-02',
    courseTitle: 'Generative AI & LLM Engineering',
    category: 'BY NEXUS AI',
    institutionId: 'TN010',
    progress: 42,
    completedModules: 3,
    totalModules: 6,
    hoursRemaining: 12,
    currentModule: 'Module 4: Prompt Engineering & Guardrails',
    status: 'active',
    enrolledAt: '2026-08-15T14:00:00Z',
    assessmentScore: null
  }
];

export const SEED_PROJECTS = [
  {
    projectId: 'PRJ-01',
    studentId: 'STU-TN010-001',
    studentName: 'Arun Kumar',
    department: 'CSE',
    institutionId: 'TN010',
    title: 'AI Resume Analyzer & ATS Parser',
    category: 'DATA & AI',
    description: 'Production ATS semantic parsing engine utilizing cosine vector similarity and zero-shot taxonomy classification.',
    technologies: ['Python', 'FastAPI', 'NLP', 'Docker'],
    repositoryUrl: 'https://github.com/arunkumar/ai-resume-analyzer',
    status: 'Verified',
    validation: {
      score: 94,
      unitTestsPassed: '96% Unit Tests Passed',
      commits: 24,
      proctorSignature: 'PROCTOR-TN010-8812',
      blockNumber: 'Block #8,941,301',
      verifiedDate: '2026-08-20'
    },
    reviewer: 'Prof. K. Ramanathan (SRM CSE Dept Lead)'
  },
  {
    projectId: 'PRJ-02',
    studentId: 'STU-TN010-001',
    studentName: 'Arun Kumar',
    department: 'CSE',
    institutionId: 'TN010',
    title: 'Real-time Cryptographic Talent Ledger',
    category: 'BLOCKCHAIN & SECURITY',
    description: 'Decentralized verifiable credentials registry with tamper-proof ZK-SNARK mathematical proofs.',
    technologies: ['Python', 'SQL', 'FastAPI', 'Cryptography'],
    repositoryUrl: 'https://github.com/arunkumar/talent-ledger-zksnark',
    status: 'Verified',
    validation: {
      score: 92,
      unitTestsPassed: '98% Unit Tests Passed',
      commits: 38,
      proctorSignature: 'PROCTOR-TN010-9104',
      blockNumber: 'Block #8,939,410',
      verifiedDate: '2026-08-28'
    },
    reviewer: 'Dr. S. Kulanthaivel'
  },
  {
    projectId: 'PRJ-03',
    studentId: 'STU-TN010-001',
    studentName: 'Arun Kumar',
    department: 'CSE',
    institutionId: 'TN010',
    title: 'Multi-Agent Autonomous RAG Assistant',
    category: 'GENERATIVE AI',
    description: 'Hierarchical query planner that orchestrates multi-agent reflection loops for technical document intelligence.',
    technologies: ['Python', 'LangChain', 'ChromaDB', 'FastAPI'],
    repositoryUrl: 'https://github.com/arunkumar/agentic-rag-engine',
    status: 'Submitted',
    validation: {
      score: null,
      unitTestsPassed: '92% Test Coverage',
      commits: 16,
      proctorSignature: null,
      blockNumber: null,
      verifiedDate: null
    },
    reviewer: 'Under Faculty Review'
  }
];

export const SEED_COMPANIES = [
  {
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    industry: 'IT & Software',
    recruiterName: 'Sarah Jenkins',
    recruiterHandle: 'TECHCORP-GLOBAL-CORP',
    email: 'talent@techcorp.global',
    location: 'Chennai (OMR Corridor) & Hybrid',
    city: 'Chennai',
    state: 'Tamil Nadu',
    hiringPreferences: {
      preferredRoles: ['Software Developer', 'Data Analyst', 'ML Engineer', 'Cloud Engineer'],
      requiredSkills: ['Python', 'SQL', 'FastAPI', 'React', 'AWS'],
      preferredProficiency: 'Intermediate',
      educationDegree: 'B.Tech / B.E.',
      educationDepartment: 'CSE & IT',
      targetGradBatch: '2026 Batch',
      experienceLevel: 'Fresher / Internship Experience',
      locationPreference: 'Hybrid (OMR Chennai / Remote)',
      opportunityType: 'Internship (PPO Convertible)'
    }
  }
];

export const SEED_OPPORTUNITIES = [
  {
    opportunityId: 'OPP-001',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    title: 'Data Analyst Intern',
    role: 'Data Analyst Intern',
    type: 'Internship',
    department: 'Data & Analytics',
    location: 'Chennai (OMR) / Hybrid',
    workMode: 'Hybrid',
    stipend: '₹35,000 / month',
    duration: '3–6 Months (PPO Convertible)',
    requiredSkills: ['Python', 'SQL', 'FastAPI', 'Data Analysis'],
    preferredSkills: ['Pandas', 'Docker', 'Power BI'],
    minimumProficiency: 'Intermediate',
    targetBatch: '2026 Batch',
    status: 'Active',
    applicantsCount: 24,
    shortlistedCount: 6,
    description: 'Build enterprise analytics pipelines and automated reporting workflows using Python and SQL.'
  },
  {
    opportunityId: 'OPP-002',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    title: 'Cloud DevOps Intern',
    role: 'Cloud DevOps Intern',
    type: 'Internship',
    department: 'Cloud Infrastructure',
    location: 'Remote (India)',
    workMode: 'Remote',
    stipend: '₹30,000 / month',
    duration: '3 Months',
    requiredSkills: ['Docker', 'Linux', 'AWS', 'Python'],
    preferredSkills: ['Kubernetes', 'CI/CD', 'Terraform'],
    minimumProficiency: 'Intermediate',
    targetBatch: '2026 Batch',
    status: 'Active',
    applicantsCount: 38,
    shortlistedCount: 8,
    description: 'Deploy resilient containerized services and automate cloud infrastructure provisioning on AWS.'
  },
  {
    opportunityId: 'OPP-003',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    title: 'Machine Learning Engineer (Junior)',
    role: 'Machine Learning Engineer (Junior)',
    type: 'Full-Time',
    department: 'AI & Systems',
    location: 'Chennai, OMR IT Corridor',
    workMode: 'On-site',
    stipend: '₹50,000 / month',
    duration: 'Full-Time Convertible',
    requiredSkills: ['PyTorch', 'Python', 'Machine Learning', 'FastAPI'],
    preferredSkills: ['LangChain', 'PostgreSQL', 'Docker'],
    minimumProficiency: 'Advanced',
    targetBatch: '2026 Batch',
    status: 'Active',
    applicantsCount: 19,
    shortlistedCount: 4,
    description: 'Develop and fine-tune scalable machine learning inference endpoints and vector retrieval architectures.'
  },
  {
    opportunityId: 'OPP-004',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    title: 'Associate Full-Stack Developer',
    role: 'Full-Stack Software Engineer',
    type: 'Full-Time',
    department: 'Product Engineering',
    location: 'Chennai (Hybrid)',
    workMode: 'Hybrid',
    stipend: '₹45,000 / month',
    duration: 'Full-Time Position',
    requiredSkills: ['React', 'Next.js', 'PostgreSQL', 'TypeScript', 'Git'],
    preferredSkills: ['Tailwind', 'REST APIs', 'Docker'],
    minimumProficiency: 'Intermediate',
    targetBatch: '2026 Batch',
    status: 'Active',
    applicantsCount: 42,
    shortlistedCount: 12,
    description: 'Design, develop, and maintain reactive web applications and scalable database schemas across our enterprise platform.'
  },
  {
    opportunityId: 'OPP-005',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    title: 'Cloud Infrastructure & DevOps Engineer',
    role: 'Site Reliability & Cloud Engineer',
    type: 'Full-Time',
    department: 'Cloud & Infrastructure',
    location: 'Chennai (On-site)',
    workMode: 'On-site',
    stipend: '₹48,000 / month',
    duration: 'Full-Time Position',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
    preferredSkills: ['Terraform', 'Prometheus', 'FastAPI'],
    minimumProficiency: 'Advanced',
    targetBatch: '2026 Batch',
    status: 'Active',
    applicantsCount: 28,
    shortlistedCount: 7,
    description: 'Deploy, automate, and orchestrate containerized cloud microservices with zero-downtime reliability and monitoring.'
  }
];

export const SEED_APPLICATIONS = [
  {
    applicationId: 'APP-001',
    opportunityId: 'OPP-001',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    studentId: 'STU-TN010-001',
    candidateName: 'Arun Kumar',
    department: 'CSE',
    roleTitle: 'Data Analyst Intern',
    matchScore: 92,
    stage: 'Interview',
    appliedAt: '2026-09-02T11:00:00Z',
    notes: 'Fast-track technical interview scheduled with lead data architect.'
  },
  {
    applicationId: 'APP-002',
    opportunityId: 'OPP-002',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    studentId: 'STU-TN010-003',
    candidateName: 'Rahul Krishnan',
    department: 'IT',
    roleTitle: 'Cloud DevOps Intern',
    matchScore: 94,
    stage: 'Shortlisted',
    appliedAt: '2026-09-01T09:30:00Z',
    notes: 'Candidate verified for Kubernetes and AWS microservices proofs.'
  },
  {
    applicationId: 'APP-003',
    opportunityId: 'OPP-003',
    companyId: 'COM001',
    companyName: 'TechCorp Global Systems',
    studentId: 'STU-TN010-004',
    candidateName: 'Deepika Raman',
    department: 'AI & DS',
    roleTitle: 'Machine Learning Engineer (Junior)',
    matchScore: 91,
    stage: 'Under Review',
    appliedAt: '2026-09-03T16:20:00Z',
    notes: 'Evaluating NLP model fine-tuning repository proof.'
  }
];

// ══════════════════════════════════════════════════════════════════════════
// 2. DATA STORE INITIALIZATION & ACCESSORS
// ══════════════════════════════════════════════════════════════════════════

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, data, eventName) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexus_data_updated', { detail: { key } }));
      if (eventName) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      }
    }
  } catch (e) {
    console.error(`Error saving to ${key}:`, e);
  }
}

// ──────────────────────────────────────────
// Student Services
// ──────────────────────────────────────────

export function getAllRelationalStudents() {
  return readStorage(KEYS.STUDENTS, SEED_STUDENTS);
}

export function getStudentByCollege(collegeId) {
  if (!collegeId) return [];
  const cleanId = String(collegeId).toUpperCase().trim();
  return getAllRelationalStudents().filter(s => {
    const sc = String(s.collegeId || '').toUpperCase().trim();
    return sc === cleanId || (cleanId === 'TN010' && sc === 'SRM001') || (cleanId === 'SRM001' && sc === 'TN010');
  });
}

export function getRelationalStudentById(studentId) {
  return getAllRelationalStudents().find(s => s.studentId === studentId) || null;
}

export function saveRelationalStudent(student) {
  const all = getAllRelationalStudents();
  const idx = all.findIndex(s => s.studentId === student.studentId || s.email === student.email);
  let updated;
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...student };
    updated = all;
  } else {
    updated = [student, ...all];
  }
  writeStorage(KEYS.STUDENTS, updated, 'nexus_students_updated');
  nexusApiClient.saveStudent(student).catch(err => console.debug('API sync deferred:', err));

  // Trigger Institution alert if new student registered
  if (idx < 0) {
    addRoleNotification('institution', {
      type: 'registration',
      title: `New Student Registered: ${student.name}`,
      message: `${student.name} (${student.department || 'CSE'}, ${student.year || 'III Year'}) joined the campus ledger.`,
      urgency: 'medium',
      metadata: { studentId: student.studentId }
    });
  }

  return student;
}

// ──────────────────────────────────────────
// Course Services
// ──────────────────────────────────────────

export function getAllCourses() {
  return readStorage(KEYS.COURSES, SEED_COURSES);
}

export function getCoursesByInstitution(instId) {
  if (!instId) return getAllCourses();
  const cleanId = String(instId).toUpperCase().trim();
  return getAllCourses().filter(c => {
    const cc = String(c.institutionId || '').toUpperCase().trim();
    return cc === cleanId || (cleanId === 'TN010' && cc === 'SRM001') || (cleanId === 'SRM001' && cc === 'TN010');
  });
}

export function createInstitutionCourse(courseData) {
  const all = getAllCourses();
  const newCourse = {
    courseId: `CRS-${courseData.institutionId || 'TN010'}-${Date.now().toString().slice(-4)}`,
    institutionId: courseData.institutionId || 'TN010',
    courseName: courseData.courseName,
    courseCode: courseData.courseCode || `CSE-${Math.floor(Math.random() * 800 + 100)}`,
    category: courseData.category || 'TECHNICAL',
    description: courseData.description || 'Comprehensive university credit course.',
    duration: courseData.duration || '6 Weeks',
    durationWeeks: parseInt(courseData.duration) || 6,
    instructor: courseData.instructor || 'Faculty Lead',
    skillsDeveloped: Array.isArray(courseData.skillsDeveloped) ? courseData.skillsDeveloped : (courseData.skillsDeveloped || '').split(',').map(s => s.trim()),
    difficulty: courseData.difficulty || 'Intermediate',
    prerequisites: courseData.prerequisites || 'None',
    modules: Array.isArray(courseData.modules) ? courseData.modules : (courseData.modules || '').split('\n').filter(Boolean),
    assessment: courseData.assessment || 'Proctored Assessment + Project',
    certificate: 'Verifiable Academic Credential',
    enrollmentStatus: 'Open for Enrollment',
    enrolledCount: 0,
    tags: Array.isArray(courseData.skillsDeveloped) ? courseData.skillsDeveloped : (courseData.skillsDeveloped || '').split(',').map(s => s.trim())
  };

  const updated = [newCourse, ...all];
  writeStorage(KEYS.COURSES, updated, 'nexus_course_created');
  nexusApiClient.createCourse(newCourse).catch(err => console.debug('API sync deferred:', err));

  // Notify Students of new course in their department
  addRoleNotification('student', {
    type: 'course',
    title: `New Course Published: ${newCourse.courseName}`,
    message: `${newCourse.courseName} is now available in your Course Catalog. Skills: ${newCourse.skillsDeveloped.slice(0, 3).join(', ')}.`,
    urgency: 'medium',
    metadata: { courseId: newCourse.courseId }
  });

  return newCourse;
}

// ──────────────────────────────────────────
// Course Enrollment Services
// ──────────────────────────────────────────

export function getAllEnrollments() {
  return readStorage(KEYS.ENROLLMENTS, SEED_ENROLLMENTS);
}

export function getStudentEnrollments(studentId) {
  return getAllEnrollments().filter(e => e.studentId === studentId);
}

export function enrollStudentInCourse(student, course) {
  const all = getAllEnrollments();
  const exists = all.find(e => e.studentId === student.studentId && e.courseId === course.courseId);
  if (exists) return { success: false, reason: 'Already enrolled' };

  const newEnrollment = {
    enrollmentId: `ENR-${Date.now()}`,
    studentId: student.studentId,
    courseId: course.courseId,
    courseTitle: course.courseName || course.title,
    category: course.category || 'TECHNICAL',
    institutionId: course.institutionId || student.collegeId || 'TN010',
    progress: 0,
    completedModules: 0,
    completedModuleIds: [],
    totalModules: (course.modules && course.modules.length) || 6,
    hoursRemaining: (course.durationWeeks || 6) * 3,
    currentModule: (course.modules && course.modules[0]) || 'Module 1: Foundations',
    status: 'active',
    enrolledAt: new Date().toISOString(),
    assessmentScore: null
  };

  const updatedEnrollments = [newEnrollment, ...all];
  writeStorage(KEYS.ENROLLMENTS, updatedEnrollments, 'nexus_course_enrolled');
  nexusApiClient.enrollInCourse(student, course).catch(err => console.debug('API sync deferred:', err));

  // Update course enrolled count
  const allCourses = getAllCourses().map(c => {
    if (c.courseId === course.courseId) {
      return { ...c, enrolledCount: (c.enrolledCount || 0) + 1 };
    }
    return c;
  });
  writeStorage(KEYS.COURSES, allCourses);

  // Trigger cross-portal notifications
  addRoleNotification('student', {
    type: 'course',
    title: `Enrolled in ${newEnrollment.courseTitle}`,
    message: `You are now enrolled. Module 1 is ready in your active learning workspace.`,
    urgency: 'high',
    metadata: { courseId: course.courseId }
  });

  addRoleNotification('institution', {
    type: 'enrollment',
    title: `Student Enrolled: ${student.name}`,
    message: `${student.name} enrolled in "${newEnrollment.courseTitle}".`,
    urgency: 'low',
    metadata: { studentId: student.studentId, courseId: course.courseId }
  });

  return { success: true, enrollment: newEnrollment };
}

export function advanceStudentCourseModule(enrollmentId, moduleId = null) {
  const all = getAllEnrollments();
  const idx = all.findIndex(e => e.enrollmentId === enrollmentId);
  if (idx < 0) return null;

  const enr = all[idx];
  const completedIds = Array.isArray(enr.completedModuleIds) ? [...enr.completedModuleIds] : [];

  if (moduleId) {
    if (completedIds.includes(moduleId)) {
      return enr; // idempotent no-op
    }
    completedIds.push(moduleId);
  } else {
    const nextModIndex = completedIds.length + 1;
    const autoId = `mod_${nextModIndex}`;
    if (completedIds.includes(autoId)) {
      return enr;
    }
    completedIds.push(autoId);
  }

  const nextMod = Math.min(enr.totalModules, completedIds.length);
  const nextPct = Math.round((nextMod / enr.totalModules) * 100);
  const isDone = nextPct >= 100;

  all[idx] = {
    ...enr,
    completedModuleIds: completedIds,
    completedModules: nextMod,
    progress: nextPct,
    hoursRemaining: Math.max(0, enr.hoursRemaining - 3),
    currentModule: isDone ? 'All Modules Completed' : `Module ${nextMod + 1}: Core Implementation`,
    status: isDone ? 'completed' : 'active',
    completedAt: isDone ? new Date().toISOString() : undefined
  };

  writeStorage(KEYS.ENROLLMENTS, all, 'nexus_enrollment_updated');
  nexusApiClient.advanceModule(enrollmentId).catch(err => console.debug('API sync deferred:', err));

  // When course completes, upgrade student's skill growth
  if (isDone) {
    upgradeStudentSkillConfidence(enr.studentId, enr.courseTitle);
  }

  return all[idx];
}

// ──────────────────────────────────────────
// Skill Growth Engine
// ──────────────────────────────────────────

export function upgradeStudentSkillConfidence(studentId, courseTitle) {
  const students = getAllRelationalStudents();
  const sIdx = students.findIndex(s => s.studentId === studentId);
  if (sIdx < 0) return;

  const student = students[sIdx];
  const updatedSkills = student.skills.map(sk => {
    if (courseTitle.toLowerCase().includes(sk.name.toLowerCase())) {
      const newConf = Math.min(98, sk.confidence + 18);
      return {
        ...sk,
        confidence: newConf,
        hasCourse: true,
        level: newConf >= 90 ? 'Advanced' : 'Intermediate',
        verified: true
      };
    }
    return sk;
  });

  students[sIdx] = {
    ...student,
    skills: updatedSkills,
    readinessScore: Math.min(99, student.readinessScore + 3)
  };

  writeStorage(KEYS.STUDENTS, students, 'nexus_students_updated');

  addRoleNotification('student', {
    type: 'assessment',
    title: `Skill Score Elevated: ${courseTitle}`,
    message: `Your verified proficiency score increased by +18% based on verified course completion evidence.`,
    urgency: 'high'
  });
}

// ──────────────────────────────────────────
// Project & Proof Services
// ──────────────────────────────────────────

export function getAllProjects() {
  return readStorage(KEYS.PROJECTS, SEED_PROJECTS);
}

export function getStudentProjects(studentId) {
  return getAllProjects().filter(p => p.studentId === studentId);
}

export function submitProjectForValidation(projectData) {
  const all = getAllProjects();
  const newPrj = {
    projectId: `PRJ-${Date.now().toString().slice(-4)}`,
    studentId: projectData.studentId || 'STU-TN010-001',
    studentName: projectData.studentName || 'Arun Kumar',
    department: projectData.department || 'CSE',
    institutionId: projectData.institutionId || 'TN010',
    title: projectData.title,
    category: projectData.category || 'SOFTWARE & SYSTEMS',
    description: projectData.description || 'Student engineered capstone project repository.',
    technologies: Array.isArray(projectData.technologies) ? projectData.technologies : (projectData.technologies || '').split(',').map(s => s.trim()),
    repositoryUrl: projectData.repositoryUrl || 'https://github.com/nexus-student/project-repo',
    status: 'Submitted',
    validation: {
      score: null,
      unitTestsPassed: 'Evaluating in Sandbox',
      commits: projectData.commits || 18,
      proctorSignature: null,
      blockNumber: null,
      verifiedDate: null
    },
    reviewer: 'Pending Faculty Review'
  };

  const updated = [newPrj, ...all];
  writeStorage(KEYS.PROJECTS, updated, 'nexus_project_submitted');
  nexusApiClient.submitProject(newPrj).catch(err => console.debug('API sync deferred:', err));

  // Notify Institution
  addRoleNotification('institution', {
    type: 'proof',
    title: `Project Submitted: ${newPrj.title}`,
    message: `${newPrj.studentName} submitted "${newPrj.title}" (${newPrj.technologies.slice(0, 3).join(', ')}) for faculty code review and ledger sealing.`,
    urgency: 'high',
    metadata: { projectId: newPrj.projectId }
  });

  return newPrj;
}

export function validateProjectByFaculty(projectId, isApproved, facultyName = 'Prof. K. Ramanathan') {
  const all = getAllProjects();
  const idx = all.findIndex(p => p.projectId === projectId);
  if (idx < 0) return null;

  const prj = all[idx];
  const blockNumber = `#8,94${Math.floor(Math.random() * 800 + 100)}`;

  all[idx] = {
    ...prj,
    status: isApproved ? 'Verified' : 'Rejected',
    reviewer: facultyName,
    validation: {
      score: isApproved ? 95 : 40,
      unitTestsPassed: isApproved ? '98% Unit Tests Passed' : 'Tests Failed',
      commits: prj.validation.commits || 24,
      proctorSignature: isApproved ? `PROCTOR-TN010-${Math.floor(Math.random() * 9000 + 1000)}` : null,
      blockNumber: isApproved ? blockNumber : null,
      verifiedDate: new Date().toISOString().split('T')[0]
    }
  };

  writeStorage(KEYS.PROJECTS, all, 'nexus_project_verified');
  nexusApiClient.validateProject(projectId, isApproved, facultyName).catch(err => console.debug('API sync deferred:', err));

  // If approved, update student skill evidence
  if (isApproved) {
    const students = getAllRelationalStudents();
    const sIdx = students.findIndex(s => s.studentId === prj.studentId);
    if (sIdx >= 0) {
      const student = students[sIdx];
      const updatedSkills = student.skills.map(sk => {
        if (prj.technologies.some(t => t.toLowerCase() === sk.name.toLowerCase())) {
          return { ...sk, hasProject: true, hasInstSeal: true, verified: true, confidence: Math.min(99, sk.confidence + 8) };
        }
        return sk;
      });
      students[sIdx] = { ...student, skills: updatedSkills, readinessScore: Math.min(99, student.readinessScore + 4) };
      writeStorage(KEYS.STUDENTS, students, 'nexus_students_updated');
    }

    addRoleNotification('student', {
      type: 'proof',
      title: `Project Proof Validated: ${prj.title}`,
      message: `Your project was verified by ${facultyName} and sealed to sovereign ledger ${blockNumber}.`,
      urgency: 'high',
      metadata: { projectId: prj.projectId }
    });
  }

  return all[idx];
}

// ──────────────────────────────────────────
// Company Opportunities & Applications
// ──────────────────────────────────────────

export function getAllCompanyOpportunities() {
  return readStorage(KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES);
}

export function createCompanyOpportunity(oppData) {
  const all = getAllCompanyOpportunities();
  const newOpp = {
    opportunityId: `OPP-${Date.now().toString().slice(-4)}`,
    companyId: oppData.companyId || 'COM001',
    companyName: oppData.companyName || 'TechCorp Global Systems',
    title: oppData.title,
    role: oppData.role || oppData.title,
    type: oppData.type || 'Internship',
    department: oppData.department || 'Engineering & Product',
    location: oppData.location || 'Chennai (Hybrid)',
    workMode: oppData.workMode || 'Hybrid',
    stipend: oppData.stipend || '₹35,000 / month',
    duration: oppData.duration || '6 Months (PPO Convertible)',
    requiredSkills: Array.isArray(oppData.requiredSkills) ? oppData.requiredSkills : (oppData.skills || '').split(',').map(s => s.trim()),
    preferredSkills: Array.isArray(oppData.preferredSkills) ? oppData.preferredSkills : [],
    minimumProficiency: oppData.minimumProficiency || 'Intermediate',
    targetBatch: oppData.targetBatch || '2026 Batch',
    status: 'Active',
    applicantsCount: 0,
    shortlistedCount: 0,
    description: oppData.description || 'Exciting engineering role matched against verified sovereign competencies.'
  };

  const updated = [newOpp, ...all];
  writeStorage(KEYS.OPPORTUNITIES, updated, 'nexus_opportunity_created');
  nexusApiClient.createOpportunity(newOpp).catch(err => console.debug('API sync deferred:', err));

  // Notify Students about new high-match opportunity
  addRoleNotification('student', {
    type: 'opportunity',
    title: `New High-Match Role: ${newOpp.title}`,
    message: `${newOpp.companyName} published "${newOpp.title}". Verified skill match threshold: 85%+.`,
    urgency: 'high',
    metadata: { opportunityId: newOpp.opportunityId }
  });

  return newOpp;
}

export function updateCompanyOpportunity(oppId, updates) {
  const all = getAllCompanyOpportunities();
  const updated = all.map(o => {
    const id = o.opportunityId || o.oppId || o.id;
    if (id === oppId) {
      return { ...o, ...updates };
    }
    return o;
  });
  writeStorage(KEYS.OPPORTUNITIES, updated, 'nexus_opportunity_created');
  return updated;
}

export function closeCompanyOpportunity(oppId) {
  return updateCompanyOpportunity(oppId, { status: 'Closed' });
}

export function deleteCompanyOpportunity(oppId) {
  const all = getAllCompanyOpportunities();
  const updated = all.filter(o => {
    const id = o.opportunityId || o.oppId || o.id;
    return id !== oppId;
  });
  writeStorage(KEYS.OPPORTUNITIES, updated, 'nexus_opportunity_created');
  return updated;
}

export function getAllApplications() {
  return readStorage(KEYS.APPLICATIONS, SEED_APPLICATIONS);
}

export function submitStudentApplication(student, opportunity) {
  const all = getAllApplications();
  const exists = all.find(a => a.studentId === student.studentId && a.opportunityId === opportunity.opportunityId);
  if (exists) return { success: false, reason: 'Already applied' };

  const matchRes = calculateNexusExplainableMatch(opportunity, student);

  const newApp = {
    applicationId: `APP-${Date.now().toString().slice(-4)}`,
    opportunityId: opportunity.opportunityId,
    companyId: opportunity.companyId || 'COM001',
    companyName: opportunity.companyName,
    studentId: student.studentId,
    candidateName: student.name,
    department: student.department,
    roleTitle: opportunity.title,
    matchScore: matchRes.matchScore,
    stage: 'New',
    appliedAt: new Date().toISOString(),
    notes: 'Candidate submitted verified credential passport and project proofs.'
  };

  const updated = [newApp, ...all];
  writeStorage(KEYS.APPLICATIONS, updated, 'nexus_application_created');
  nexusApiClient.submitApplication(student, opportunity).catch(err => console.debug('API sync deferred:', err));

  // Increment opportunity applicants
  const allOpps = getAllCompanyOpportunities().map(o => {
    if (o.opportunityId === opportunity.opportunityId) {
      return { ...o, applicantsCount: (o.applicantsCount || 0) + 1 };
    }
    return o;
  });
  writeStorage(KEYS.OPPORTUNITIES, allOpps);

  // Notify Company & Student
  addRoleNotification('company', {
    type: 'application',
    title: `Application Received: ${student.name}`,
    message: `${student.name} applied for "${opportunity.title}" with a ${matchRes.matchScore}% explainable fit index.`,
    urgency: 'high',
    metadata: { applicationId: newApp.applicationId, studentId: student.studentId }
  });

  addRoleNotification('student', {
    type: 'opportunity',
    title: `Application Sent: ${opportunity.title}`,
    message: `Your verified application and Digital Passport were dispatched to ${opportunity.companyName}.`,
    urgency: 'medium'
  });

  return { success: true, application: newApp };
}

export function advanceApplicationStage(applicationId, newStage) {
  const all = getAllApplications();
  const idx = all.findIndex(a => a.applicationId === applicationId);
  if (idx < 0) return null;

  all[idx] = { ...all[idx], stage: newStage };
  writeStorage(KEYS.APPLICATIONS, all, 'nexus_application_stage_changed');
  nexusApiClient.updateApplicationStage(applicationId, newStage).catch(err => console.debug('API sync deferred:', err));

  const app = all[idx];

  // Notify Student of recruitment progression
  if (newStage === 'Interview') {
    addRoleNotification('student', {
      type: 'opportunity',
      title: `Interview Dispatched by ${app.companyName}`,
      message: `You have been advanced to Technical Interview for "${app.roleTitle}". Fast-track proctor link generated.`,
      urgency: 'high',
      metadata: { applicationId: app.applicationId }
    });
  } else if (newStage === 'Selected') {
    addRoleNotification('student', {
      type: 'opportunity',
      title: `Offer Extended: ${app.companyName}!`,
      message: `Congratulations! ${app.companyName} selected you for the "${app.roleTitle}" opportunity.`,
      urgency: 'high'
    });
  }

  return all[idx];
}

// ══════════════════════════════════════════════════════════════════════════
// 3. DETERMINISTIC NEXUS AI EXPLAINABLE MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════════════

/**
 * Deterministic Explainable Matching Formula:
 * Match = 0.35 * SkillMatch + 0.25 * ProjectEvidence + 0.20 * AssessmentScore + 0.20 * CareerGoalAlignment
 */
export function calculateNexusExplainableMatch(opportunity, student) {
  if (!opportunity || !student) {
    return {
      matchScore: 85,
      skillMatch: 85,
      projectMatch: 80,
      assessmentMatch: 85,
      careerGoalMatch: 88,
      readiness: 90,
      criticalGaps: [],
      whyMatches: 'Matches requirements based on verified technical stack.',
      recommendedAction: 'Keep learning'
    };
  }

  const reqSkills = (opportunity.requiredSkills || []).map(s => s.toLowerCase().trim());
  const studentSkills = (student.skills || []).map(s => ({
    name: s.name.toLowerCase().trim(),
    confidence: s.confidence || 75,
    verified: Boolean(s.verified)
  }));

  // 1. Skill Match Score (35% weight)
  let matchedSkillCount = 0;
  let skillScoreSum = 0;
  const criticalGaps = [];

  reqSkills.forEach(req => {
    const found = studentSkills.find(s => s.name.includes(req) || req.includes(s.name));
    if (found) {
      matchedSkillCount++;
      skillScoreSum += found.confidence;
    } else {
      criticalGaps.push(req.charAt(0).toUpperCase() + req.slice(1));
    }
  });

  const skillMatch = reqSkills.length > 0
    ? Math.round((skillScoreSum / (reqSkills.length * 100)) * 100)
    : 85;

  // 2. Project Evidence Match (25% weight)
  const studentProjects = getStudentProjects(student.studentId);
  let projectMatch = 70;
  if (studentProjects.length > 0) {
    const verifiedProjects = studentProjects.filter(p => p.status === 'Verified');
    const relevantProjects = verifiedProjects.filter(p =>
      p.technologies.some(t => reqSkills.some(r => r.includes(t.toLowerCase()) || t.toLowerCase().includes(r)))
    );
    projectMatch = Math.min(98, 60 + (relevantProjects.length * 15) + (verifiedProjects.length * 5));
  }

  // 3. Assessment Evidence (20% weight)
  let assessmentMatch = 80;
  if (student.assessments && student.assessments.length > 0) {
    const avgScore = student.assessments.reduce((sum, a) => sum + (Number(a.score) || 80), 0) / student.assessments.length;
    assessmentMatch = Math.round(avgScore);
  }

  // 4. Career Goal Alignment (20% weight)
  let careerGoalMatch = 85;
  const prefRoles = (student.preferredRoles || []).map(r => r.toLowerCase());
  const targetRole = (opportunity.role || opportunity.title || '').toLowerCase();
  if (prefRoles.some(pr => targetRole.includes(pr) || pr.includes(targetRole))) {
    careerGoalMatch = 95;
  }

  // Final Weighted Composite Match Score
  const matchScore = Math.min(99, Math.max(50, Math.round(
    (0.35 * skillMatch) +
    (0.25 * projectMatch) +
    (0.20 * assessmentMatch) +
    (0.20 * careerGoalMatch)
  )));

  // Natural Language Explainability
  const matchedNames = reqSkills.filter(r => !criticalGaps.some(g => g.toLowerCase() === r)).map(s => s.toUpperCase());
  const whyMatches = `${student.name}'s verified mastery in ${matchedNames.slice(0, 3).join(', ')} directly fulfills your technical criteria with ${projectMatch}% validated Git code proof backing. Proctor assessments place candidate in top national percentiles.`;

  const recommendedAction = criticalGaps.length > 0
    ? `Enroll in campus bootcamp for ${criticalGaps[0]} to elevate fit to 98%.`
    : 'Candidate is 100% placement ready for 1-click fast-track interview.';

  return {
    matchScore,
    skillMatch,
    projectMatch,
    assessmentMatch,
    careerGoalMatch,
    readiness: student.readinessScore || 90,
    criticalGaps,
    whyMatches,
    recommendedAction
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 3. CANONICAL SERVICE LAYER API INTERFACE (PHASE 3)
// ══════════════════════════════════════════════════════════════════════════
export async function getStudent(studentId) {
  const local = getRelationalStudentById(studentId);
  try {
    const remote = await nexusApiClient.getStudent(studentId);
    if (remote) return remote;
  } catch {}
  return local;
}

export function getStudentSkills(studentId) {
  const student = getRelationalStudentById(studentId);
  return student ? student.skills || [] : [];
}

export async function getCourses(institutionId = null) {
  const local = institutionId ? getCoursesByInstitution(institutionId) : getAllCourses();
  try {
    const remote = await nexusApiClient.getCourses(institutionId);
    if (remote && remote.length > 0) return remote;
  } catch {}
  return local;
}

export async function enrollCourse(student, course) {
  return enrollStudentInCourse(student, course);
}

export async function submitProject(projectData) {
  return submitProjectForValidation(projectData);
}

export async function getOpportunities() {
  const local = getAllCompanyOpportunities();
  try {
    const remote = await nexusApiClient.getOpportunities();
    if (remote && remote.length > 0) return remote;
  } catch {}
  return local;
}

export async function applyOpportunity(student, opportunity) {
  return submitStudentApplication(student, opportunity);
}

