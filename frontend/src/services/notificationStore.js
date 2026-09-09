/**
 * SKILLNEXUS AI - Central Notification Store
 * Single source of truth for all role-specific notifications.
 * Supports Student, Institution, and Company roles with strict data isolation.
 */

import { nexusApiClient } from './nexusApiClient';

const STORAGE_KEY = 'nexus_notifications_data';

export function normalizeRole(role) {
  if (!role) return 'student';
  const r = String(role).toLowerCase().trim();
  if (r === 'industry' || r === 'company' || r === 'recruiter') return 'company';
  if (r === 'institution' || r === 'academia') return 'institution';
  return 'student';
}

export const SEED_NOTIFICATIONS = [
  /* ═══════════════════════════════════════════════════════════════════════
     STUDENT NOTIFICATIONS (role: 'student')
     ═══════════════════════════════════════════════════════════════════════ */
  {
    id: 'notif_01',
    role: 'student',
    type: 'high_match',
    title: 'New High-Match Internship',
    preview: 'ABC Technologies posted Data Analyst Intern matching 92% of your verified competencies.',
    time: '2 hours ago',
    timestamp: '2026-09-04T20:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#28D7FF',
    categoryLabel: 'High-Match Internship',
    details: {
      matchPercentage: 92,
      role: 'Data Analyst Intern',
      company: 'ABC Technologies',
      location: 'Bengaluru, Karnataka (Hybrid)',
      duration: '6 Months • Full-Time',
      compensation: '₹35,000 / month',
      deadline: 'September 25, 2026',
      whyReceived: 'Your verified scores in Python (96%), SQL (78%), and Problem Solving (84%) directly align with ABC Technologies core stack.',
      matchedSkills: ['Python', 'SQL', 'Data Analytics', 'Excel'],
      criticalGaps: ['Power BI'],
      whyRecommends: 'Tech stack matches 92% of your verified competencies on the Sovereign Ledger with immediate 1-click Express Apply readiness.',
      action: 'opportunities'
    }
  },
  {
    id: 'notif_02',
    role: 'student',
    type: 'project_validated',
    title: 'Project Proof Validated',
    preview: 'Your "AI Resume Analyzer & ATS Parser" project was verified and sealed to your Digital Passport.',
    time: '5 hours ago',
    timestamp: '2026-09-04T17:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#2FE0A1',
    categoryLabel: 'Project Proof',
    details: {
      project: 'AI Resume Analyzer & ATS Parser',
      validationStatus: 'VERIFIED // ZK-PROCTOR-OCT24',
      validatedSkills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
      validationDate: 'September 4, 2026',
      validatedBy: 'SRM Institute of Science and Technology',
      proctorHash: '0x94f8128bc91a782b',
      evidence: 'GitHub commit audit on main branch (24 commits, production Dockerfile, 96% test pass rate).',
      impact: 'Your verified technical capability score increased from 78% to 84%. Recruiter visibility boosted by +18% on Talent Discovery radar.',
      action: 'projects'
    }
  },
  {
    id: 'notif_03',
    role: 'student',
    type: 'company_internship',
    title: 'Company / Internship Details',
    preview: 'CloudScale Systems has opened candidate pre-screening for Cloud DevOps Internships.',
    time: 'Yesterday',
    timestamp: '2026-09-03T15:30:00.000Z',
    unread: true,
    deleted: false,
    color: '#3478FF',
    categoryLabel: 'Company Brief',
    details: {
      company: 'CloudScale Systems',
      overview: 'Leading cloud-native infrastructure automation provider powering high-throughput enterprise SaaS backends.',
      role: 'Cloud DevOps Intern',
      location: 'Remote (India)',
      duration: '3 Months (PPO Convertible)',
      eligibility: '3rd & 4th Year B.Tech Computer Science / IT with Linux & Docker foundation.',
      requiredSkills: ['Docker', 'Linux', 'AWS', 'Python', 'CI/CD'],
      deadline: 'October 10, 2026',
      matchPercentage: 86,
      whyItMatches: 'Your verified Python mastery and completed systems networking modules satisfy their Tier-1 candidate filter.',
      action: 'opportunities'
    }
  },
  {
    id: 'notif_04',
    role: 'student',
    type: 'course_reminder',
    title: 'Course Reminder',
    preview: 'You have an unfinished module in "Generative AI & RAG Architecture". Complete today to maintain your 7-day streak!',
    time: '2 days ago',
    timestamp: '2026-09-02T10:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'Course Reminder',
    details: {
      course: 'Generative AI & LLM Systems',
      currentProgress: 68,
      remainingHours: '4.5 Hours',
      nextModule: 'Module 4: Vector Embedding Indexes & ChromaDB Retrieval',
      reminderText: 'You have 1 active coding sandbox lab waiting for execution. Complete it to unlock the Multi-Agent Orchestration milestone.',
      recommendedCompletion: 'By Sunday, Sep 7, 2026',
      action: 'learning'
    }
  },
  {
    id: 'notif_05',
    role: 'student',
    type: 'skill_gap',
    title: 'Skill Gap Identified',
    preview: 'Power BI & System Design identified as priority gaps for your target Data Scientist / AI role.',
    time: '3 days ago',
    timestamp: '2026-09-01T12:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#EC4899',
    categoryLabel: 'Skill Gap',
    details: {
      skill: 'Power BI & Business Analytics',
      currentLevel: 42,
      targetLevel: 75,
      gapPercentage: 33,
      whyItMatters: 'This competency appears in 78% of Tier-1 candidate requirements for Data Scientist and BI Engineer job openings.',
      recommendedActions: [
        'Enroll in Applied BI & Power BI Interactive Sprint',
        'Build and attest 1 dashboard project on sample sales dataset',
        'Request Nexus AI diagnostic assessment to verify proof'
      ],
      recommendedCourse: 'Applied BI & Power BI Interactive Sprint',
      action: 'learning'
    }
  },
  {
    id: 'notif_06',
    role: 'student',
    type: 'assessment_ready',
    title: 'Assessment Results Ready',
    preview: 'Your Programming & Python Diagnostic has been graded. You scored 84% (92nd percentile).',
    time: '4 days ago',
    timestamp: '2026-08-31T18:20:00.000Z',
    unread: false,
    deleted: false,
    color: '#28D7FF',
    categoryLabel: 'Assessment Ready',
    details: {
      assessment: 'Programming & Python Diagnostic Assessment',
      score: 84,
      accuracy: 88,
      durationTaken: '42 Minutes',
      percentile: '92nd National Percentile',
      strongAreas: ['Python Syntax & Slicing', 'Object-Oriented Design', 'Linear Data Structures'],
      weakAreas: ['Dynamic Programming Memoization', 'Graph Traversal Complexity'],
      proctorProof: 'ATTESTED // PROCTOR-ID-8812',
      recommendedNextStep: 'Take the Algorithms & Graphs Remediation sprint to push your mastery past 90%.',
      action: 'assessment'
    }
  },
  {
    id: 'notif_07',
    role: 'student',
    type: 'certificate_earned',
    title: 'Certificate Earned',
    preview: 'Congratulations! You earned the certified credential: Full-Stack Cloud Microservices Specialist.',
    time: '5 days ago',
    timestamp: '2026-08-30T11:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#10B981',
    categoryLabel: 'Certificate',
    details: {
      certificate: 'Full-Stack Cloud Microservices Specialist',
      issuer: 'SkillNexus AI & Tamil Nadu Skill Council',
      credentialId: 'SNX-CERT-2026-8819',
      issueDate: 'August 30, 2026',
      skillsCredited: ['Node.js', 'Docker', 'Kubernetes', 'FastAPI'],
      verificationUrl: 'https://skillnexus.ai/verify/SNX-CERT-2026-8819',
      action: 'passport'
    }
  },
  {
    id: 'notif_08',
    role: 'student',
    type: 'badge_earned',
    title: 'Badge Earned: High Velocity Builder',
    preview: 'You unlocked the "Top 5% Project Architect" badge for publishing 3 verified production projects.',
    time: '6 days ago',
    timestamp: '2026-08-29T14:15:00.000Z',
    unread: false,
    deleted: false,
    color: '#F59E0B',
    categoryLabel: 'Badge',
    details: {
      badge: 'Top 5% Project Architect',
      tier: 'Diamond Tier',
      criteria: 'Attested 3 full-stack GitHub repositories with automated CI/CD and unit test coverage >= 90%.',
      action: 'passport'
    }
  },
  {
    id: 'notif_09',
    role: 'student',
    type: 'enrollment_confirmed',
    title: 'Course Enrollment Confirmation',
    preview: 'Successfully enrolled in "Cloud Architecture & High-Scale Distributed Systems".',
    time: '1 week ago',
    timestamp: '2026-08-28T09:30:00.000Z',
    unread: false,
    deleted: false,
    color: '#3B82F6',
    categoryLabel: 'Enrollment',
    details: {
      course: 'Cloud Architecture & High-Scale Distributed Systems',
      modules: 12,
      duration: '6 Weeks',
      instructor: 'Dr. S. Ranganathan',
      action: 'learning'
    }
  },
  {
    id: 'notif_10',
    role: 'student',
    type: 'learning_update',
    title: 'Learning Progress Update',
    preview: 'Weekly velocity report: You completed 14 coding challenges and gained +6% overall competency.',
    time: '1 week ago',
    timestamp: '2026-08-27T17:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#06B6D4',
    categoryLabel: 'Progress Update',
    details: {
      completedLabs: 14,
      studyHours: '18.5 hrs',
      velocityGain: '+6.2%',
      action: 'learning-progress'
    }
  },
  {
    id: 'notif_11',
    role: 'student',
    type: 'institution_announcement',
    title: 'New Institution Announcement',
    preview: 'SRM Placement Cell: Campus recruitment drives for 2026 batch begin next Monday.',
    time: '1 week ago',
    timestamp: '2026-08-26T08:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'Announcement',
    details: {
      title: 'Phase-1 Campus Placement Drives 2026',
      issuedBy: 'SRM Institute Directorate of Career Center',
      date: 'September 8, 2026',
      action: 'opportunities'
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════
     INSTITUTION NOTIFICATIONS (role: 'institution')
     ═══════════════════════════════════════════════════════════════════════ */
  {
    id: 'inst_notif_01',
    role: 'institution',
    type: 'new_student',
    title: 'New Student Registered',
    preview: 'Deepika Raman (AI & DS, III Year) has registered under your institution.',
    time: '1 hour ago',
    timestamp: '2026-09-04T21:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#28D7FF',
    categoryLabel: 'New Student',
    details: {
      student: 'Deepika Raman',
      studentId: 'STU-2026-9042',
      department: 'AI & DS',
      year: 'III Year',
      email: 'deepika.r@srmist.edu.in',
      skills: ['PyTorch', 'LangChain', 'Python'],
      action: 'institution-students'
    }
  },
  {
    id: 'inst_notif_02',
    role: 'institution',
    type: 'proof_submitted',
    title: 'Project Proof Submitted',
    preview: 'Rahul Krishnan submitted "Enterprise ERP Microservices" for institutional validation.',
    time: '3 hours ago',
    timestamp: '2026-09-04T19:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#2FE0A1',
    categoryLabel: 'Proof Review',
    details: {
      student: 'Rahul Krishnan',
      project: 'Enterprise ERP Microservices',
      department: 'IT',
      year: 'IV Year',
      status: 'Pending Validation',
      action: 'institution-proofs'
    }
  },
  {
    id: 'inst_notif_03',
    role: 'institution',
    type: 'high_readiness',
    title: 'High-Readiness Student',
    preview: 'Karthik Venkatesh has reached 88% Career Readiness — eligible for Placement Pipeline.',
    time: 'Yesterday',
    timestamp: '2026-09-03T14:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'Placement Ready',
    details: {
      student: 'Karthik Venkatesh',
      readiness: '88%',
      department: 'CSE',
      year: 'IV Year',
      skills: ['Go', 'Docker', 'gRPC', 'PostgreSQL'],
      action: 'institution-placement'
    }
  },
  {
    id: 'inst_notif_04',
    role: 'institution',
    type: 'assessment_completed',
    title: 'Student Assessment Completed',
    preview: 'Ananya Sridhar completed Logical Reasoning assessment with 72% score.',
    time: '2 days ago',
    timestamp: '2026-09-02T11:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#F59E0B',
    categoryLabel: 'Assessment',
    details: {
      student: 'Ananya Sridhar',
      assessment: 'Logical Reasoning',
      score: '72%',
      department: 'EEE',
      year: 'I Year',
      action: 'institution-readiness'
    }
  },
  {
    id: 'inst_notif_05',
    role: 'institution',
    type: 'course_enrollment',
    title: 'New Course Enrollment',
    preview: '6 students enrolled in Python for Data Science this week.',
    time: '3 days ago',
    timestamp: '2026-09-01T09:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#06B6D4',
    categoryLabel: 'Course Activity',
    details: {
      course: 'Python for Data Science',
      enrollments: 6,
      totalEnrolled: 24,
      action: 'institution-courses'
    }
  },
  {
    id: 'inst_notif_06',
    role: 'institution',
    type: 'placement_candidate',
    title: 'Placement Candidate Available',
    preview: 'Priya Sundaram is now available in the Placement Pipeline for ECE roles.',
    time: '4 days ago',
    timestamp: '2026-08-31T16:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#2FE0A1',
    categoryLabel: 'Placement',
    details: {
      student: 'Priya Sundaram',
      department: 'ECE',
      year: 'II Year',
      skills: ['C++', 'IoT', 'Embedded Systems'],
      action: 'institution-placement'
    }
  },
  {
    id: 'inst_notif_07',
    role: 'institution',
    type: 'student_skill_updated',
    title: 'Student Skill Updated',
    preview: 'Arun Kumar verified new competency: Advanced PyTorch & Transformer Models (94%).',
    time: '5 days ago',
    timestamp: '2026-08-30T15:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#28D7FF',
    categoryLabel: 'Skill Update',
    details: {
      student: 'Arun Kumar',
      skill: 'Advanced PyTorch & Transformer Models',
      department: 'CSE',
      year: 'III Year',
      proficiency: '94% (Expert)',
      action: 'institution-students'
    }
  },
  {
    id: 'inst_notif_08',
    role: 'institution',
    type: 'proof_required',
    title: 'Project Proof Validation Required',
    preview: '3 pending senior design projects require faculty attestation before the placement drive.',
    time: '6 days ago',
    timestamp: '2026-08-29T10:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#EF4444',
    categoryLabel: 'Urgent Action',
    details: {
      pendingCount: 3,
      department: 'Computer Science & IT',
      deadline: 'September 10, 2026',
      action: 'institution-proofs'
    }
  },
  {
    id: 'inst_notif_09',
    role: 'institution',
    type: 'course_completion',
    title: 'Course Completion Milestone',
    preview: '18 students in B.Tech CSE completed the AWS Cloud Foundation Sprint.',
    time: '1 week ago',
    timestamp: '2026-08-28T16:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#10B981',
    categoryLabel: 'Milestone',
    details: {
      course: 'AWS Cloud Foundation Sprint',
      completedCount: 18,
      cohort: 'B.Tech CSE - 2026 Batch',
      action: 'institution-courses'
    }
  },
  {
    id: 'inst_notif_10',
    role: 'institution',
    type: 'inst_announcement',
    title: 'Institution Announcement Published',
    preview: 'Announcement broadcasted to 482 students regarding mock interviews by alumni.',
    time: '1 week ago',
    timestamp: '2026-08-27T11:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'Broadcast',
    details: {
      title: 'Alumni Mock Interview Week',
      audience: 'III & IV Year Engineering',
      status: 'Active Broadcast',
      action: 'institution-console'
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COMPANY (INDUSTRY) NOTIFICATIONS (role: 'company')
     ═══════════════════════════════════════════════════════════════════════ */
  {
    id: 'ind_notif_01',
    role: 'company',
    type: 'new_candidate',
    title: 'New High-Match Candidate',
    preview: 'Rahul Krishnan (IV Year, IT) matches 94% of your Cloud DevOps requirements.',
    time: '30 min ago',
    timestamp: '2026-09-04T21:30:00.000Z',
    unread: true,
    deleted: false,
    color: '#28D7FF',
    categoryLabel: 'New Candidate',
    details: {
      candidate: 'Rahul Krishnan',
      match: '94%',
      college: 'SRM Institute of Science and Technology',
      skills: ['Java', 'Kubernetes', 'AWS', 'Next.js'],
      experience: 'IV Year B.Tech IT',
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_02',
    role: 'company',
    type: 'application_received',
    title: 'Student Application Received',
    preview: 'Karthik Venkatesh applied for your Cloud DevOps Intern position.',
    time: '2 hours ago',
    timestamp: '2026-09-04T20:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#2FE0A1',
    categoryLabel: 'Application',
    details: {
      candidate: 'Karthik Venkatesh',
      role: 'Cloud DevOps Intern',
      college: 'SRM Institute of Science and Technology',
      match: '88%',
      skills: ['Go', 'Docker', 'gRPC', 'Redis'],
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_03',
    role: 'company',
    type: 'skill_updated',
    title: 'Candidate Skill Updated',
    preview: 'Deepika Raman verified new skill: PyTorch Specialist (Advanced). Match score updated to 91%.',
    time: 'Yesterday',
    timestamp: '2026-09-03T10:00:00.000Z',
    unread: true,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'Skill Update',
    details: {
      candidate: 'Deepika Raman',
      newSkill: 'PyTorch Specialist',
      level: 'Advanced',
      updatedMatch: '91%',
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_04',
    role: 'company',
    type: 'interview_reminder',
    title: 'Interview Reminder',
    preview: 'Technical interview with Arun Kumar scheduled for tomorrow at 10:00 AM.',
    time: '2 days ago',
    timestamp: '2026-09-02T08:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#F59E0B',
    categoryLabel: 'Interview',
    details: {
      candidate: 'Arun Kumar',
      scheduledAt: 'September 5, 2026 at 10:00 AM',
      role: 'Data Analyst Intern',
      format: 'Video Call (Google Meet)',
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_05',
    role: 'company',
    type: 'project_evidence',
    title: 'Project Evidence Available',
    preview: 'Ananya Sridhars Solar Inverter Controller project proof is now verified on the Ledger.',
    time: '3 days ago',
    timestamp: '2026-09-01T14:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#10B981',
    categoryLabel: 'Project Proof',
    details: {
      candidate: 'Ananya Sridhar',
      project: 'Renewable Solar Inverter Controller',
      proofStatus: 'Verified',
      ledgerBlock: '#7821',
      skills: ['C', 'MATLAB', 'Python'],
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_06',
    role: 'company',
    type: 'internship_app',
    title: 'Internship Application: Express Apply',
    preview: 'Arun Kumar submitted 1-click Express Application for Data Analyst Intern with verified portfolio.',
    time: '4 days ago',
    timestamp: '2026-08-31T12:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#06B6D4',
    categoryLabel: 'Express Apply',
    details: {
      candidate: 'Arun Kumar',
      role: 'Data Analyst Intern',
      college: 'SRM Institute of Science and Technology',
      match: '92%',
      skills: ['Python', 'SQL', 'FastAPI', 'Pandas'],
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_07',
    role: 'company',
    type: 'app_status',
    title: 'Candidate Status Milestone',
    preview: 'Priya Sundaram accepted your preliminary technical screening invitation.',
    time: '5 days ago',
    timestamp: '2026-08-30T09:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#2FE0A1',
    categoryLabel: 'Candidate Response',
    details: {
      candidate: 'Priya Sundaram',
      role: 'Embedded Systems Intern',
      status: 'Screening Accepted',
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_08',
    role: 'company',
    type: 'high_match_candidate',
    title: 'High-Match Candidate: System Alert',
    preview: 'Nexus AI identified 3 new candidates with 90%+ match in Chennai tech corridor.',
    time: '6 days ago',
    timestamp: '2026-08-29T15:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#38BDF8',
    categoryLabel: 'Talent Radar',
    details: {
      count: 3,
      targetRole: 'Cloud DevOps Intern',
      topSkills: ['Docker', 'AWS', 'Python', 'Kubernetes'],
      action: 'industry-portal'
    }
  },
  {
    id: 'ind_notif_09',
    role: 'company',
    type: 'institution_recommendation',
    title: 'Institution Recommendation',
    preview: 'SRM Placement Directorate recommended 5 top students for your Fall Recruitment drive.',
    time: '1 week ago',
    timestamp: '2026-08-28T14:00:00.000Z',
    unread: false,
    deleted: false,
    color: '#8B5CF6',
    categoryLabel: 'TPO Endorsement',
    details: {
      institution: 'SRM Institute of Science and Technology',
      endorsedCohort: 'CSE & IT - IV Year Honors',
      candidatesCount: 5,
      action: 'industry-portal'
    }
  }
];

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_notifications_updated'));
  }
}

export function loadAllNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    // Automatically merge missing seed notifications so newly added role items appear
    const existingIds = new Set(parsed.map(n => n.id));
    const missing = SEED_NOTIFICATIONS.filter(s => !existingIds.has(s.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading notifications:', err);
    return SEED_NOTIFICATIONS;
  }
}

export function saveAllNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    notifySubscribers();
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function getActiveNotifications() {
  const all = loadAllNotifications();
  return all.filter(n => !n.deleted);
}

export function getTrashNotifications() {
  const all = loadAllNotifications();
  return all.filter(n => n.deleted);
}

/** Role-isolated getters — guaranteed data isolation between roles */
export function getActiveNotificationsByRole(role, user = null) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  const isDemo = !user || user?.email?.toLowerCase() === 'arun.kumar@nexus.edu' || user?.id === 'usr_001';
  return all.filter(n => {
    if (n.deleted) return false;
    if (normalizeRole(n.role) !== normRole) return false;
    if (normRole === 'student' && !isDemo) {
      if (n.id && n.id.startsWith('notif_0') && n.role === 'student') return false;
    }
    return true;
  });
}

export function getTrashNotificationsByRole(role, user = null) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  const isDemo = !user || user?.email?.toLowerCase() === 'arun.kumar@nexus.edu' || user?.id === 'usr_001';
  return all.filter(n => {
    if (!n.deleted) return false;
    if (normalizeRole(n.role) !== normRole) return false;
    if (normRole === 'student' && !isDemo) {
      if (n.id && n.id.startsWith('notif_0') && n.role === 'student') return false;
    }
    return true;
  });
}

export function getUnreadCount(role, user = null) {
  if (role) {
    return getActiveNotificationsByRole(role, user).filter(n => n.unread).length;
  }
  const active = getActiveNotifications();
  return active.filter(n => n.unread).length;
}

export function getNotificationById(id) {
  const all = loadAllNotifications();
  return all.find(n => n.id === id) || null;
}

export function markAsRead(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => n.id === id ? { ...n, unread: false } : n);
  saveAllNotifications(updated);
  nexusApiClient.markNotificationRead(id).catch(err => console.debug('API sync deferred:', err));
}

export function markAllAsRead(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (!normRole || normalizeRole(n.role) === normRole) {
      return { ...n, unread: false };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.markAllNotificationsRead(normRole).catch(err => console.debug('API sync deferred:', err));
}

export function softDeleteNotification(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.id === id) {
      return {
        ...n,
        deleted: true,
        deletedAt: new Date().toISOString()
      };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.softDeleteNotification(id).catch(err => console.debug('API sync deferred:', err));
}

export function restoreNotification(id) {
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.id === id) {
      return {
        ...n,
        deleted: false,
        deletedAt: null
      };
    }
    return n;
  });
  saveAllNotifications(updated);
  nexusApiClient.restoreNotification(id).catch(err => console.debug('API sync deferred:', err));
}

export function restoreAllNotifications(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.map(n => {
    if (n.deleted && (!normRole || normalizeRole(n.role) === normRole)) {
      return {
        ...n,
        deleted: false,
        deletedAt: null
      };
    }
    return n;
  });
  saveAllNotifications(updated);
}

export function permanentlyDeleteNotification(id) {
  const all = loadAllNotifications();
  const updated = all.filter(n => n.id !== id);
  saveAllNotifications(updated);
}

export function emptyTrash(role) {
  const normRole = role ? normalizeRole(role) : null;
  const all = loadAllNotifications();
  const updated = all.filter(n => !(n.deleted && (!normRole || normalizeRole(n.role) === normRole)));
  saveAllNotifications(updated);
  nexusApiClient.emptyTrash(normRole).catch(err => console.debug('API sync deferred:', err));
}

export function addRoleNotification(role, notifData) {
  const normRole = normalizeRole(role);
  const all = loadAllNotifications();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`,
    role: normRole,
    type: notifData.type || 'system',
    title: notifData.title || 'System Notification',
    preview: notifData.message || notifData.preview || 'New activity recorded on the sovereign ledger.',
    time: 'Just now',
    timestamp: new Date().toISOString(),
    unread: true,
    deleted: false,
    color: notifData.urgency === 'high' ? '#28D7FF' : notifData.urgency === 'medium' ? '#2FE0A1' : '#8B5CF6',
    categoryLabel: notifData.type ? notifData.type.toUpperCase() : 'PLATFORM',
    details: notifData.details || {
      whyReceived: notifData.message || 'Activity synced across the SkillNexus network.',
      action: notifData.action || 'view'
    }
  };

  const updated = [newNotif, ...all];
  saveAllNotifications(updated);
  nexusApiClient.addNotification(normRole, notifData).catch(err => console.debug('API sync deferred:', err));
  return newNotif;
}
