/**
 * SKILLNEXUS AI — Student Data Store & Institution Linking Service
 * Single source of truth for student records, college mapping, and institution roster queries.
 */

import { getCollegeById } from './collegeDirectory';

const STORAGE_KEY = 'nexus_students';

// Initial realistic student seed across key Tamil Nadu colleges
const INITIAL_STUDENTS = [
  // SRM Institute of Science and Technology (TN010)
  {
    studentId: 'STU-TN010-001',
    name: 'Arun Kumar',
    email: 'arun.kumar@nexus.edu',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'CSE',
    year: 'III Year',
    status: 'Active',
    skills: ['Python', 'SQL', 'React', 'TensorFlow', 'Docker'],
    learningProgress: 76,
    assessments: { logical: '88%', aptitude: '84%', programming: '92%' },
    projects: ['AI Pneumonia Diagnostics Platform', 'Real-time Cryptographic Ledger'],
    verifiedSkills: ['Python Core', 'React 18', 'TensorFlow ML'],
    registeredAt: '2025-08-12T10:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN010-002',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'ECE',
    year: 'II Year',
    status: 'Active',
    skills: ['C++', 'Embedded Systems', 'IoT', 'MATLAB'],
    learningProgress: 64,
    assessments: { logical: '80%', aptitude: '78%', programming: '74%' },
    projects: ['Smart Agri-Sensor Node', 'RISC-V Micro-architecture Simulation'],
    verifiedSkills: ['Embedded C', 'IoT Architecture'],
    registeredAt: '2025-09-01T14:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN010-003',
    name: 'Rahul Krishnan',
    email: 'rahul.k@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'IT',
    year: 'IV Year',
    status: 'Active',
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'AWS', 'Next.js', 'PostgreSQL'],
    learningProgress: 91,
    assessments: { logical: '94%', aptitude: '90%', programming: '96%' },
    projects: ['Enterprise ERP Microservices', 'Distributed Kafka Log Streamer'],
    verifiedSkills: ['Java Enterprise', 'AWS Solutions Architect', 'Cloud Native'],
    registeredAt: '2025-06-20T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN010-004',
    name: 'Deepika Raman',
    email: 'deepika.r@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'AI & DS',
    year: 'III Year',
    status: 'Active',
    skills: ['PyTorch', 'LLMs', 'LangChain', 'Python', 'FastAPI'],
    learningProgress: 82,
    assessments: { logical: '91%', aptitude: '86%', programming: '89%' },
    projects: ['Tamil Vernacular LLM Assistant', 'Multimodal RAG Pipeline'],
    verifiedSkills: ['Deep Learning', 'PyTorch Specialist', 'NLP Pipeline'],
    registeredAt: '2025-08-25T11:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN010-005',
    name: 'Karthik Venkatesh',
    email: 'karthik.v@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'CSE',
    year: 'IV Year',
    status: 'Active',
    skills: ['Go', 'Docker', 'gRPC', 'PostgreSQL', 'Redis'],
    learningProgress: 88,
    assessments: { logical: '89%', aptitude: '87%', programming: '93%' },
    projects: ['High-throughput Trading Engine Simulator', 'Distributed Cache Engine'],
    verifiedSkills: ['Go Systems Programming', 'Distributed Systems'],
    registeredAt: '2025-07-14T16:20:00Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN010-006',
    name: 'Ananya Sridhar',
    email: 'ananya.s@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    department: 'EEE',
    year: 'I Year',
    status: 'Active',
    skills: ['C', 'MATLAB', 'Circuit Simulation', 'Python'],
    learningProgress: 48,
    assessments: { logical: '72%', aptitude: '75%', programming: '65%' },
    projects: ['Renewable Solar Inverter Controller', 'Automated Grid Monitor'],
    verifiedSkills: ['Basic Embedded Design'],
    registeredAt: '2025-10-05T08:10:00Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },

  // Anna University (TN001)
  {
    studentId: 'STU-TN001-001',
    name: 'Siddharth M',
    email: 'siddharth.m@annauniv.edu',
    collegeId: 'TN001',
    collegeName: 'Anna University',
    department: 'CSE',
    year: 'III Year',
    status: 'Active',
    skills: ['Python', 'Rust', 'Linux Kernel', 'Distributed Systems'],
    learningProgress: 85,
    assessments: { logical: '93%', aptitude: '89%', programming: '95%' },
    projects: ['Custom Memory Allocator', 'Async Network Event Loop'],
    verifiedSkills: ['Rust Core', 'Linux Internals'],
    registeredAt: '2025-08-18T12:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN001-002',
    name: 'Nandhini Balaji',
    email: 'nandhini.b@annauniv.edu',
    collegeId: 'TN001',
    collegeName: 'Anna University',
    department: 'AI & DS',
    year: 'II Year',
    status: 'Active',
    skills: ['Python', 'TensorFlow', 'Data Visualization', 'SQL'],
    learningProgress: 69,
    assessments: { logical: '84%', aptitude: '82%', programming: '79%' },
    projects: ['Traffic Pattern Congestion Forecaster'],
    verifiedSkills: ['Python Data Analysis'],
    registeredAt: '2025-09-12T15:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN001-003',
    name: 'Vikram Chandran',
    email: 'vikram.c@annauniv.edu',
    collegeId: 'TN001',
    collegeName: 'Anna University',
    department: 'MECH',
    year: 'IV Year',
    status: 'Active',
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Robotics'],
    learningProgress: 77,
    assessments: { logical: '82%', aptitude: '85%', programming: '68%' },
    projects: ['Autonomous Robotic Manipulator', 'Thermal Dissipation Heat Sink Optimization'],
    verifiedSkills: ['CAD Modeling', 'Finite Element Analysis'],
    registeredAt: '2025-07-29T10:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },

  // PSG College of Technology (TN030)
  {
    studentId: 'STU-TN030-001',
    name: 'Sowmya Murugan',
    email: 'sowmya.m@psgtech.edu',
    collegeId: 'TN030',
    collegeName: 'PSG College of Technology',
    department: 'CSE',
    year: 'III Year',
    status: 'Active',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'GraphQL'],
    learningProgress: 81,
    assessments: { logical: '90%', aptitude: '88%', programming: '92%' },
    projects: ['Collaborative Whiteboard Canvas', 'Campus Asset Management'],
    verifiedSkills: ['Full Stack Web', 'TypeScript Pro'],
    registeredAt: '2025-08-20T09:40:00Z',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    studentId: 'STU-TN030-002',
    name: 'Vigneshwaran P',
    email: 'vignesh.p@psgtech.edu',
    collegeId: 'TN030',
    collegeName: 'PSG College of Technology',
    department: 'ECE',
    year: 'IV Year',
    status: 'Active',
    skills: ['VLSI', 'Verilog', 'FPGA', 'Digital Signal Processing'],
    learningProgress: 89,
    assessments: { logical: '92%', aptitude: '91%', programming: '85%' },
    projects: ['FPGA Accelerated FFT Engine', 'Low-power 8-bit RISC CPU Core'],
    verifiedSkills: ['Verilog HDL', 'FPGA Prototyping'],
    registeredAt: '2025-06-15T14:10:00Z',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },

  // VIT Chennai (TN021)
  {
    studentId: 'STU-TN021-001',
    name: 'Aditya Swaminathan',
    email: 'aditya.s@vitchennai.edu.in',
    collegeId: 'TN021',
    collegeName: 'VIT Chennai Campus',
    department: 'CSE',
    year: 'III Year',
    status: 'Active',
    skills: ['Python', 'Cybersecurity', 'Ethical Hacking', 'Wireshark', 'Linux'],
    learningProgress: 79,
    assessments: { logical: '87%', aptitude: '83%', programming: '88%' },
    projects: ['Zero-Trust Campus Authentication Guard', 'DNS Spoofing Defense Daemon'],
    verifiedSkills: ['Certified Cyber Defender', 'Network Forensics'],
    registeredAt: '2025-08-30T11:20:00Z',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },

  // SSN College of Engineering (TN051)
  {
    studentId: 'STU-TN051-001',
    name: 'Keerthana Natarajan',
    email: 'keerthana.n@ssn.edu.in',
    collegeId: 'TN051',
    collegeName: 'SSN College of Engineering',
    department: 'IT',
    year: 'II Year',
    status: 'Active',
    skills: ['Java', 'DSA', 'Spring Boot', 'SQL'],
    learningProgress: 71,
    assessments: { logical: '86%', aptitude: '84%', programming: '82%' },
    projects: ['Automated Library Cataloguing API'],
    verifiedSkills: ['Data Structures & Algorithms in Java'],
    registeredAt: '2025-09-08T13:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

/**
 * Load all students from storage (or seed if uninitialized).
 */
export function getAllStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading students from storage:', e);
    return INITIAL_STUDENTS;
  }
}

/**
 * Get students registered strictly under a specific institution's collegeId.
 * Guarantees institution data isolation: Institution A never sees Institution B students.
 */
export function getStudentsByCollegeId(collegeId) {
  if (!collegeId) return [];
  const all = getAllStudents();
  const targetId = collegeId.toUpperCase().trim();

  return all.filter(s => {
    if (!s.collegeId) return false;
    const sId = s.collegeId.toUpperCase().trim();
    if (sId === targetId) return true;

    // Backward-compatible alias matching for demo institutions
    if ((targetId === 'TN010' || targetId === 'TN-DEEM-0001') && (sId === 'TN010' || sId === 'TN-DEEM-0001')) return true;
    if ((targetId === 'TN001' || targetId === 'TN-UNIV-0002') && (sId === 'TN001' || sId === 'TN-UNIV-0002')) return true;
    if ((targetId === 'TN030' || targetId === 'TN-ENG-0007') && (sId === 'TN030' || sId === 'TN-ENG-0007')) return true;
    if ((targetId === 'TN020' || targetId === 'TN-DEEM-0003') && (sId === 'TN020' || sId === 'TN-DEEM-0003')) return true;
    if ((targetId === 'TN051' || targetId === 'TN-ENG-0003') && (sId === 'TN051' || sId === 'TN-ENG-0003')) return true;

    return false;
  });
}

/**
 * Get a single student by ID.
 */
export function getStudentById(studentId) {
  const all = getAllStudents();
  return all.find(s => s.studentId === studentId) || null;
}

/**
 * Register a new student into the directory.
 * Automatically resolves college information from the college directory.
 */
export function registerStudent(studentData) {
  const all = getAllStudents();

  // Resolve official college
  const college = getCollegeById(studentData.collegeId);
  const officialCollegeName = college ? college.collegeName : (studentData.collegeName || 'Tamil Nadu Institution');

  // Compute clean studentId if not provided
  const idPrefix = studentData.collegeId ? `STU-${studentData.collegeId}` : 'STU-TN';
  const newStudentId = studentData.studentId || `${idPrefix}-${(all.length + 101).toString().padStart(3, '0')}`;

  const newStudent = {
    studentId: newStudentId,
    name: studentData.name || studentData.fullName || 'Student',
    email: studentData.email,
    collegeId: studentData.collegeId,
    collegeName: officialCollegeName,
    department: studentData.department || studentData.degree || 'CSE',
    year: studentData.year || 'III Year',
    status: 'Active',
    skills: studentData.skills && studentData.skills.length ? studentData.skills : [],
    learningProgress: studentData.learningProgress || 0,
    assessments: studentData.assessments || {},
    projects: studentData.projects || [],
    verifiedSkills: studentData.verifiedSkills || [],
    hasCompletedQuestionnaire: false,
    registeredAt: new Date().toISOString(),
    avatar: studentData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentData.name || 'nexus')}`
  };

  const updated = [newStudent, ...all];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving new student:', e);
  }

  // Dispatch live update event for real-time reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_students_updated', {
      detail: { student: newStudent, collegeId: newStudent.collegeId }
    }));
  }

  return newStudent;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENROLLMENT & CREDENTIAL STORE (Learning Page)
// ─────────────────────────────────────────────────────────────────────────────

const ENROLLMENT_KEY = 'nexus_enrollments';
const CREDENTIAL_KEY = 'nexus_credentials';

/** Return all enrollments for a student (by email or studentId) */
export function getEnrollments(identifier) {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    const all = raw ? JSON.parse(raw) : [];
    return all.filter(e => e.studentId === identifier || e.email === identifier);
  } catch { return []; }
}

/** Enroll a student in a course. Prevents duplicates. Returns { ok, enrollment }. */
export function enrollCourse(studentId, email, course) {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const dup = all.find(e => (e.studentId === studentId || e.email === email) && e.courseId === course.courseId);
    if (dup) return { ok: false, reason: 'already_enrolled', enrollment: dup };

    const enrollment = {
      enrollmentId: `ENR-${Date.now()}`,
      studentId,
      email,
      courseId: course.courseId,
      courseTitle: course.title,
      category: course.category,
      collegeId: course.collegeId,
      progress: 0,
      completedModules: 0,
      totalModules: course.totalModules || 12,
      hoursRemaining: course.durationWeeks ? course.durationWeeks * 3 : 24,
      currentModule: `Module 1: ${course.module1 || 'Introduction'}`,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };

    all.unshift(enrollment);
    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('nexus_enrollment_updated', { detail: enrollment }));
    return { ok: true, enrollment };
  } catch (e) {
    console.error('enrollCourse error:', e);
    return { ok: false, reason: 'error' };
  }
}

/** Advance one module for an enrollment */
export function advanceModule(enrollmentId) {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(e => e.enrollmentId === enrollmentId);
    if (idx === -1) return null;

    const e = all[idx];
    const newMod = Math.min(e.totalModules, e.completedModules + 1);
    const newPct = Math.round((newMod / e.totalModules) * 100);
    all[idx] = {
      ...e,
      completedModules: newMod,
      progress: newPct,
      hoursRemaining: Math.max(0, e.hoursRemaining - 2),
      currentModule: `Module ${newMod + 1}: Lesson ${newMod + 1}`,
      status: newPct >= 100 ? 'completed' : 'active',
      completedAt: newPct >= 100 ? new Date().toISOString() : undefined
    };

    localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(all));

    // Auto-issue credential on completion
    if (newPct >= 100) {
      issueCredential(e.studentId, e.email, all[idx]);
    }

    window.dispatchEvent(new CustomEvent('nexus_enrollment_updated', { detail: all[idx] }));
    return all[idx];
  } catch { return null; }
}

/** Issue a credential when a course completes */
export function issueCredential(studentId, email, enrollment) {
  try {
    const raw = localStorage.getItem(CREDENTIAL_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const dup = all.find(c => c.courseId === enrollment.courseId && (c.studentId === studentId || c.email === email));
    if (dup) return dup;

    const cred = {
      credentialId: `NX-${Math.random().toString(36).slice(2,6).toUpperCase()}-${enrollment.category?.slice(0,3) || 'GEN'}`,
      studentId,
      email,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      category: enrollment.category,
      issuedAt: new Date().toISOString(),
      type: 'Certificate',
      level: 'Intermediate',
      score: Math.floor(Math.random() * 20 + 75) + '%',
      badgeUrl: null
    };

    all.unshift(cred);
    localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('nexus_credential_issued', { detail: cred }));
    return cred;
  } catch { return null; }
}

/** Get all credentials for a student */
export function getCredentials(identifier) {
  try {
    const raw = localStorage.getItem(CREDENTIAL_KEY);
    const all = raw ? JSON.parse(raw) : [];
    return all.filter(c => c.studentId === identifier || c.email === identifier);
  } catch { return []; }
}

/** Seed initial demo enrollments only for predefined legacy demo account */
export function seedDemoEnrollments(studentId, email, collegeId) {
  // Only seed for explicit legacy sample account, never for real signups
  if (studentId !== 'STU-TN010-001' && email !== 'arun.kumar@vit.edu') return;
  const existing = getEnrollments(studentId);
  if (existing.length > 0) return;

  const demoEnrollments = [
    { courseId: 'COURSE-001', title: 'Python for Data Science', category: 'DATA & AI', totalModules: 24, completedModules: 18, progress: 75, hoursRemaining: 6, module1: 'Variables & Types', durationWeeks: 8, collegeId },
    { courseId: 'COURSE-002', title: 'Generative AI Fundamentals', category: 'BY NEXUS AI', totalModules: 12, completedModules: 5, progress: 42, hoursRemaining: 11, module1: 'Transformers Basics', durationWeeks: 6, collegeId },
    { courseId: 'COURSE-003', title: 'Advanced SQL for Data Engineering', category: 'DATABASE', totalModules: 13, completedModules: 8, progress: 61, hoursRemaining: 4, module1: 'Relational Model', durationWeeks: 4, collegeId }
  ];

  demoEnrollments.forEach(c => enrollCourse(studentId, email, c));
}
