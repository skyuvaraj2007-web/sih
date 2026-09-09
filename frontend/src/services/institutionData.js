/**
 * SKILLNEXUS AI — Institution Intelligence Data Service
 * Single source of truth for Academic Workspace:
 * - Comprehensive Student Records (Academic, Skills, Learning, Career)
 * - Company Intelligence & Directory
 * - Company Opportunities (Jobs, Internships, Projects, Hackathons)
 * - Student–Company Matching Engine
 * - Skill Gap Diagnostics (Campus vs Industry)
 * - Course & Training Recommendations (Closed-Loop)
 * - Placement Pipeline & Recruitment Funnels
 * - Institution Analytics & Alerts
 */

const STORAGE_KEYS = {
  OPPORTUNITIES: 'nexus_institution_opportunities',
  COURSES: 'nexus_institution_courses',
  ALERTS: 'nexus_institution_alerts',
  STUDENTS: 'nexus_institution_students_ext'
};

// ─── 1. EXTENDED STUDENT INTELLIGENCE DATABASE ───────────────────────────────
export const INITIAL_INSTITUTION_STUDENTS = [
  {
    studentId: 'STU-TN010-001',
    regNo: 'RA2211003010001',
    name: 'Arun Kumar',
    email: 'arun.kumar@nexus.edu',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    // Academic
    department: 'CSE',
    batch: '2026',
    semester: 'Sem 6',
    cgpa: '8.92',
    backlogs: 0,
    attendance: '94%',
    // Skills
    registeredSkills: ['Python', 'SQL', 'React', 'TensorFlow', 'Docker'],
    assessedSkills: [
      { skill: 'Python', level: 'Advanced', score: 92, verified: true },
      { skill: 'SQL', level: 'Advanced', score: 88, verified: true },
      { skill: 'React', level: 'Intermediate', score: 79, verified: true },
      { skill: 'TensorFlow', level: 'Intermediate', score: 74, verified: true },
      { skill: 'Docker', level: 'Beginner', score: 58, verified: false }
    ],
    proficiencyLevel: 'Advanced',
    skillCompletionPct: 82,
    skillGrowth: '+14%',
    prioritySkillGaps: ['Cloud Architecture (AWS)', 'Kubernetes'],
    // Learning
    enrolledCourses: ['Python for Data Science', 'Full Stack MERN Architecture', 'TensorFlow Deep Learning'],
    completedCourses: ['Python for Data Science', 'Data Structures & Algorithms in Python'],
    courseProgress: 84,
    certificates: ['Cryptographic Python Specialist', 'React 18 Architecture'],
    badges: ['Code Master Gold', 'Algorithmic Thinker', '100 Days of Code'],
    // Career
    projects: ['AI Pneumonia Diagnostics Platform', 'Real-time Cryptographic Ledger'],
    internships: ['Machine Learning Intern at DataPulse (Summer 2025)'],
    resumeUploaded: true,
    preferredRoles: ['Data Scientist', 'AI/ML Engineer', 'Full Stack Developer'],
    placementStatus: 'Placement Ready',
    careerReadinessScore: 91,
    registeredAt: '2025-08-12T10:30:00Z'
  },
  {
    studentId: 'STU-TN010-002',
    regNo: 'RA2211003010045',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'ECE',
    batch: '2026',
    semester: 'Sem 6',
    cgpa: '8.45',
    backlogs: 0,
    attendance: '91%',
    registeredSkills: ['C++', 'Embedded Systems', 'IoT', 'MATLAB', 'Python'],
    assessedSkills: [
      { skill: 'C++', level: 'Advanced', score: 86, verified: true },
      { skill: 'Embedded Systems', level: 'Advanced', score: 84, verified: true },
      { skill: 'IoT', level: 'Intermediate', score: 76, verified: true },
      { skill: 'Python', level: 'Intermediate', score: 68, verified: false }
    ],
    proficiencyLevel: 'Intermediate',
    skillCompletionPct: 70,
    skillGrowth: '+9%',
    prioritySkillGaps: ['RTOS', 'FPGA Programming'],
    enrolledCourses: ['Embedded C Mastery', 'IoT Systems & Edge Computing'],
    completedCourses: ['Embedded C Mastery'],
    courseProgress: 68,
    certificates: ['Embedded Systems Attestation'],
    badges: ['Hardware Hacker', 'Circuit Champion'],
    projects: ['Smart Agri-Sensor Node', 'RISC-V Micro-architecture Simulation'],
    internships: ['IoT Research Intern at Bosch India'],
    resumeUploaded: true,
    preferredRoles: ['Embedded Systems Engineer', 'IoT Firmware Developer'],
    placementStatus: 'In Process',
    careerReadinessScore: 78,
    registeredAt: '2025-09-01T14:15:00Z'
  },
  {
    studentId: 'STU-TN010-003',
    regNo: 'RA2111003010112',
    name: 'Rahul Krishnan',
    email: 'rahul.k@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    batch: '2025',
    semester: 'Sem 8',
    cgpa: '9.35',
    backlogs: 0,
    attendance: '96%',
    registeredSkills: ['Java', 'Spring Boot', 'Kubernetes', 'AWS', 'Next.js', 'PostgreSQL'],
    assessedSkills: [
      { skill: 'Java', level: 'Expert', score: 96, verified: true },
      { skill: 'Spring Boot', level: 'Expert', score: 94, verified: true },
      { skill: 'AWS', level: 'Advanced', score: 91, verified: true },
      { skill: 'Kubernetes', level: 'Advanced', score: 86, verified: true },
      { skill: 'PostgreSQL', level: 'Advanced', score: 90, verified: true }
    ],
    proficiencyLevel: 'Expert',
    skillCompletionPct: 94,
    skillGrowth: '+18%',
    prioritySkillGaps: ['Terraform'],
    enrolledCourses: ['Enterprise Java & Spring Cloud', 'AWS Cloud Solutions Architecture'],
    completedCourses: ['Enterprise Java & Spring Cloud', 'AWS Cloud Solutions Architecture', 'Distributed Systems Design'],
    courseProgress: 98,
    certificates: ['AWS Certified Solutions Architect (Associate)', 'Java Enterprise Specialist'],
    badges: ['Cloud Titan', 'System Architect Elite', 'Gold Top Performer'],
    projects: ['Enterprise ERP Microservices', 'Distributed Kafka Log Streamer'],
    internships: ['Software Engineer Intern at Zoho Corp (PPO Offered)'],
    resumeUploaded: true,
    preferredRoles: ['Cloud Architect', 'Backend SDE', 'DevOps Engineer'],
    placementStatus: 'Placed',
    careerReadinessScore: 97,
    registeredAt: '2025-06-20T09:00:00Z'
  },
  {
    studentId: 'STU-TN010-004',
    regNo: 'RA2211003010204',
    name: 'Deepika Raman',
    email: 'deepika.r@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'AI & DS',
    batch: '2026',
    semester: 'Sem 6',
    cgpa: '9.18',
    backlogs: 0,
    attendance: '95%',
    registeredSkills: ['PyTorch', 'LLMs', 'LangChain', 'Python', 'FastAPI', 'Vector Databases'],
    assessedSkills: [
      { skill: 'Python', level: 'Expert', score: 95, verified: true },
      { skill: 'PyTorch', level: 'Advanced', score: 91, verified: true },
      { skill: 'LangChain', level: 'Advanced', score: 89, verified: true },
      { skill: 'LLMs', level: 'Advanced', score: 88, verified: true },
      { skill: 'FastAPI', level: 'Intermediate', score: 82, verified: true }
    ],
    proficiencyLevel: 'Advanced',
    skillCompletionPct: 88,
    skillGrowth: '+22%',
    prioritySkillGaps: ['Model Deployment & vLLM Optimization'],
    enrolledCourses: ['Generative AI & LLM Engineering', 'Prompt Optimization & RAG Systems'],
    completedCourses: ['Generative AI & LLM Engineering'],
    courseProgress: 89,
    certificates: ['Generative AI Engineer Attestation', 'Deep Learning Specialist'],
    badges: ['AI Pioneer', 'Prompt Master', 'Research Fellow'],
    projects: ['Tamil Vernacular LLM Assistant', 'Multimodal RAG Pipeline for Medical Texts'],
    internships: ['AI Research Fellow at IIT Madras Research Park'],
    resumeUploaded: true,
    preferredRoles: ['Generative AI Engineer', 'AI Research Scientist', 'Data Scientist'],
    placementStatus: 'Placement Ready',
    careerReadinessScore: 94,
    registeredAt: '2025-08-25T11:45:00Z'
  },
  {
    studentId: 'STU-TN010-005',
    regNo: 'RA2111003010078',
    name: 'Karthik Venkatesh',
    email: 'karthik.v@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    batch: '2025',
    semester: 'Sem 8',
    cgpa: '8.88',
    backlogs: 0,
    attendance: '92%',
    registeredSkills: ['Go', 'Docker', 'gRPC', 'PostgreSQL', 'Redis', 'Kubernetes'],
    assessedSkills: [
      { skill: 'Go', level: 'Advanced', score: 93, verified: true },
      { skill: 'Docker', level: 'Advanced', score: 88, verified: true },
      { skill: 'PostgreSQL', level: 'Advanced', score: 86, verified: true },
      { skill: 'gRPC', level: 'Intermediate', score: 82, verified: true },
      { skill: 'Kubernetes', level: 'Intermediate', score: 76, verified: false }
    ],
    proficiencyLevel: 'Advanced',
    skillCompletionPct: 85,
    skillGrowth: '+12%',
    prioritySkillGaps: ['eBPF & Linux Kernel Profiling'],
    enrolledCourses: ['High-Performance Go Microservices', 'Container Orchestration & DevOps'],
    completedCourses: ['High-Performance Go Microservices'],
    courseProgress: 86,
    certificates: ['Go Systems Programming Attestation'],
    badges: ['Gopher Pro', 'Systems Wizard'],
    projects: ['High-throughput Trading Engine Simulator', 'Distributed Cache Engine'],
    internships: ['Backend Engineering Intern at PhonePe'],
    resumeUploaded: true,
    preferredRoles: ['Distributed Systems Engineer', 'Backend SDE', 'Fintech Platform Dev'],
    placementStatus: 'Placement Ready',
    careerReadinessScore: 89,
    registeredAt: '2025-07-14T16:20:00Z'
  },
  {
    studentId: 'STU-TN010-006',
    regNo: 'RA2411003010319',
    name: 'Ananya Sridhar',
    email: 'ananya.s@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'EEE',
    batch: '2027',
    semester: 'Sem 4',
    cgpa: '7.85',
    backlogs: 0,
    attendance: '89%',
    registeredSkills: ['C', 'MATLAB', 'Circuit Simulation', 'Python'],
    assessedSkills: [
      { skill: 'C', level: 'Intermediate', score: 74, verified: true },
      { skill: 'MATLAB', level: 'Intermediate', score: 71, verified: true },
      { skill: 'Circuit Simulation', level: 'Intermediate', score: 68, verified: false },
      { skill: 'Python', level: 'Beginner', score: 55, verified: false }
    ],
    proficiencyLevel: 'Beginner',
    skillCompletionPct: 48,
    skillGrowth: '+6%',
    prioritySkillGaps: ['Data Structures', 'Python OOP', 'Microcontrollers'],
    enrolledCourses: ['Python for Engineers', 'Digital Electronics Fundamentals'],
    completedCourses: ['Digital Electronics Fundamentals'],
    courseProgress: 45,
    certificates: ['Digital Circuits Foundation'],
    badges: ['Curious Learner'],
    projects: ['Renewable Solar Inverter Controller', 'Automated Grid Monitor'],
    internships: [],
    resumeUploaded: false,
    preferredRoles: ['Electrical Design Intern', 'Automation Trainee'],
    placementStatus: 'Unplaced',
    careerReadinessScore: 54,
    registeredAt: '2025-10-05T08:10:00Z'
  },
  {
    studentId: 'STU-TN010-007',
    regNo: 'RA2211003010189',
    name: 'Vikram Chandrasekar',
    email: 'vikram.c@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'MECH',
    batch: '2026',
    semester: 'Sem 6',
    cgpa: '8.12',
    backlogs: 1,
    attendance: '86%',
    registeredSkills: ['AutoCAD', 'SolidWorks', 'Python', 'ANSYS', '3D Printing'],
    assessedSkills: [
      { skill: 'SolidWorks', level: 'Advanced', score: 85, verified: true },
      { skill: 'AutoCAD', level: 'Advanced', score: 82, verified: true },
      { skill: 'ANSYS', level: 'Intermediate', score: 70, verified: true },
      { skill: 'Python', level: 'Beginner', score: 48, verified: false }
    ],
    proficiencyLevel: 'Intermediate',
    skillCompletionPct: 62,
    skillGrowth: '+8%',
    prioritySkillGaps: ['Computational Fluid Dynamics', 'Python Automation'],
    enrolledCourses: ['Robotics CAD & Simulation', 'Python for Mechanical Automation'],
    completedCourses: ['Robotics CAD & Simulation'],
    courseProgress: 60,
    certificates: ['SolidWorks CSWA Certified'],
    badges: ['CAD Drafter Pro'],
    projects: ['Autonomous Mobile Robot Chassis', 'Quadcopter Frame FEA Optimization'],
    internships: ['Design Trainee at L&T Heavy Engineering'],
    resumeUploaded: true,
    preferredRoles: ['Robotics Design Engineer', 'Mechanical Simulation Specialist'],
    placementStatus: 'In Process',
    careerReadinessScore: 68,
    registeredAt: '2025-08-18T10:00:00Z'
  },
  {
    studentId: 'STU-TN010-008',
    regNo: 'RA2211003010278',
    name: 'Swetha Natarajan',
    email: 'swetha.n@srmist.edu.in',
    collegeId: 'TN010',
    collegeName: 'SRM Institute of Science and Technology',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    batch: '2026',
    semester: 'Sem 6',
    cgpa: '8.76',
    backlogs: 0,
    attendance: '93%',
    registeredSkills: ['Cybersecurity', 'Ethical Hacking', 'Linux', 'Python', 'Wireshark', 'Cryptography'],
    assessedSkills: [
      { skill: 'Cybersecurity', level: 'Advanced', score: 88, verified: true },
      { skill: 'Ethical Hacking', level: 'Advanced', score: 84, verified: true },
      { skill: 'Linux', level: 'Advanced', score: 86, verified: true },
      { skill: 'Python', level: 'Intermediate', score: 75, verified: true }
    ],
    proficiencyLevel: 'Advanced',
    skillCompletionPct: 80,
    skillGrowth: '+16%',
    prioritySkillGaps: ['Cloud Security (AWS Security Hub)', 'SIEM / Splunk'],
    enrolledCourses: ['Offensive Cybersecurity & PenTesting', 'Linux Kernel Security'],
    completedCourses: ['Offensive Cybersecurity & PenTesting'],
    courseProgress: 82,
    certificates: ['Certified Ethical Hacker (CEH) Trainee'],
    badges: ['CTF Winner', 'Shield Guardian'],
    projects: ['Network Anomaly IDS with Snort', 'Vulnerability Scanner with Scapy'],
    internships: ['Security Analyst Intern at QuickHeal'],
    resumeUploaded: true,
    preferredRoles: ['SOC Analyst', 'Penetration Tester', 'Cloud Security Associate'],
    placementStatus: 'Placement Ready',
    careerReadinessScore: 86,
    registeredAt: '2025-07-28T14:30:00Z'
  }
];

// ─── 2. COMPANY INTELLIGENCE DIRECTORY ───────────────────────────────────────
export const COMPANY_DIRECTORY = [
  {
    id: 'comp_msft',
    companyName: 'Microsoft Corporation',
    industry: 'Cloud, Software & AI',
    location: 'Bengaluru / Hyderabad (India HQ: Redmond, WA)',
    companySize: '10,000+ Employees',
    hrContact: {
      name: 'Pooja Anand',
      designation: 'Head of University Talent Acquisition',
      email: 'university.in@microsoft.com',
      phone: '+91 80 6789 2000'
    },
    partnerStatus: 'Strategic Tier 1 Partner (MoU Active)',
    previousRecruitment: {
      totalHired: 42,
      lastYearIntake: 18,
      avgCTC: '₹28.5 LPA',
      highestCTC: '₹51.2 LPA'
    },
    currentOpenings: [
      {
        role: 'Software Engineer (SWE)',
        department: 'Azure Cloud Platforms',
        openings: 12,
        requiredSkills: ['Python', 'DSA', 'Azure', 'C++', 'Distributed Systems'],
        preferredQualifications: 'B.Tech CSE/IT/AI&DS, CGPA ≥ 8.5, No Active Backlogs'
      },
      {
        role: 'Data Scientist (AI Platform)',
        department: 'Microsoft Research & Copilot AI',
        openings: 6,
        requiredSkills: ['Python', 'PyTorch', 'SQL', 'LLMs', 'Prompt Engineering'],
        preferredQualifications: 'B.Tech / M.Tech AI&DS/CSE, Top 10% in Coding Assessments'
      },
      {
        role: 'Cloud Solutions Architect Trainee',
        department: 'Commercial Cloud Customer Success',
        openings: 8,
        requiredSkills: ['Azure', 'Linux', 'Networking', 'Python', 'Docker'],
        preferredQualifications: 'B.Tech All Engineering Streams, Cloud Certification Preferred'
      }
    ],
    highDemandSkills: [
      { name: 'Python', demandLevel: '95% Critical' },
      { name: 'DSA & Algorithms', demandLevel: '94% Critical' },
      { name: 'Azure Cloud', demandLevel: '88% High' },
      { name: 'SQL & Data Modeling', demandLevel: '85% High' },
      { name: 'Generative AI & LLMs', demandLevel: '92% Critical' }
    ]
  },
  {
    id: 'comp_zoho',
    companyName: 'Zoho Corporation',
    industry: 'Enterprise SaaS & Cloud Products',
    location: 'Chennai / Tenkasi / Tirunelveli',
    companySize: '12,000+ Employees',
    hrContact: {
      name: 'K. Balasubramanian',
      designation: 'Campus Hiring Lead (Tamil Nadu)',
      email: 'campus@zohocorp.com',
      phone: '+91 44 6744 7000'
    },
    partnerStatus: 'Strategic Campus Partner (Direct PPO)',
    previousRecruitment: {
      totalHired: 88,
      lastYearIntake: 34,
      avgCTC: '₹8.5 - ₹16.0 LPA',
      highestCTC: '₹22.0 LPA'
    },
    currentOpenings: [
      {
        role: 'Software Developer (Backend)',
        department: 'Zoho CRM & Suite Core',
        openings: 25,
        requiredSkills: ['Java', 'C++', 'Data Structures', 'PostgreSQL', 'Multi-threading'],
        preferredQualifications: 'Strong logic, problem solving, zero reliance on frameworks'
      },
      {
        role: 'Front-End UI/UX Engineer',
        department: 'Zoho Workplace Design Systems',
        openings: 15,
        requiredSkills: ['JavaScript (ES6+)', 'HTML5/CSS3', 'React', 'Performance Tuning'],
        preferredQualifications: 'High aesthetic sensitivity and core JS mastery'
      }
    ],
    highDemandSkills: [
      { name: 'Java Core', demandLevel: '96% Critical' },
      { name: 'DSA & Logic', demandLevel: '98% Critical' },
      { name: 'C++', demandLevel: '82% High' },
      { name: 'PostgreSQL', demandLevel: '80% High' }
    ]
  },
  {
    id: 'comp_google',
    companyName: 'Google India',
    industry: 'Hyperscale Cloud, Search & AI',
    location: 'Bengaluru / Hyderabad',
    companySize: '150,000+ Globally',
    hrContact: {
      name: 'Vikram Sethi',
      designation: 'APAC University Recruiter',
      email: 'university-apac@google.com',
      phone: '+91 80 6721 8000'
    },
    partnerStatus: 'Tier 1 Dream Recruiter',
    previousRecruitment: {
      totalHired: 12,
      lastYearIntake: 5,
      avgCTC: '₹38.5 LPA',
      highestCTC: '₹54.0 LPA'
    },
    currentOpenings: [
      {
        role: 'Associate Software Engineer',
        department: 'Google Cloud Platform',
        openings: 8,
        requiredSkills: ['Go', 'C++', 'Python', 'Distributed Systems', 'Algorithms'],
        preferredQualifications: 'Extensive algorithmic problem solving, LeetCode Hard / Codeforces candidate'
      }
    ],
    highDemandSkills: [
      { name: 'Algorithms & Complexity', demandLevel: '99% Critical' },
      { name: 'Go / C++', demandLevel: '92% Critical' },
      { name: 'Distributed Systems', demandLevel: '89% High' }
    ]
  },
  {
    id: 'comp_aws',
    companyName: 'Amazon Web Services (AWS)',
    industry: 'Cloud Infrastructure & Serverless',
    location: 'Chennai / Hyderabad',
    companySize: '100,000+ Globally',
    hrContact: {
      name: 'Smita Nambiar',
      designation: 'Campus Talent Partner',
      email: 'aws-campus-in@amazon.com',
      phone: '+91 44 4900 1200'
    },
    partnerStatus: 'Active Technical Partner',
    previousRecruitment: {
      totalHired: 28,
      lastYearIntake: 14,
      avgCTC: '₹22.0 LPA',
      highestCTC: '₹44.0 LPA'
    },
    currentOpenings: [
      {
        role: 'Cloud Support Associate',
        department: 'AWS Premium Support',
        openings: 18,
        requiredSkills: ['Linux', 'Networking', 'Python', 'AWS Services', 'Docker'],
        preferredQualifications: 'Hands-on troubleshooting, AWS CCP or SAA certification'
      }
    ],
    highDemandSkills: [
      { name: 'AWS Cloud Services', demandLevel: '95% Critical' },
      { name: 'Linux Administration', demandLevel: '90% High' },
      { name: 'Docker / Containers', demandLevel: '88% High' }
    ]
  }
];

// ─── 3. COMPANY OPPORTUNITIES ───────────────────────────────────────────────
export const INITIAL_OPPORTUNITIES = [
  {
    id: 'opp_abc_01',
    companyName: 'ABC Technologies',
    title: 'AI Engineer Internship',
    type: 'Internship',
    stipend: '₹35,000 / month',
    duration: '6 Months',
    location: 'Bengaluru / Hybrid',
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Cloud (AWS/GCP)'],
    eligibleCount: 86,
    matchingCount: 52,
    status: 'Published to Campus',
    approvedByInstitution: true,
    publishedAt: '2026-08-20',
    description: 'Build enterprise production RAG pipelines and vector database models for FinTech clients.'
  },
  {
    id: 'opp_msft_01',
    companyName: 'Microsoft',
    title: 'Cloud & DevOps Engineering Intern',
    type: 'Internship (PPO Track)',
    stipend: '₹50,000 / month',
    duration: '3 Months (Summer 2026)',
    location: 'Bengaluru / Hyderabad',
    requiredSkills: ['Azure', 'Python', 'Docker', 'Kubernetes', 'Linux'],
    eligibleCount: 120,
    matchingCount: 68,
    status: 'Published to Campus',
    approvedByInstitution: true,
    publishedAt: '2026-08-22',
    description: 'Work directly inside the Azure Container Apps engineering org on scaling microservices.'
  },
  {
    id: 'opp_zoho_01',
    companyName: 'Zoho Corporation',
    title: 'Full Stack Java Product Developer',
    type: 'Job (Full-Time)',
    stipend: '₹12.0 – ₹18.0 LPA',
    duration: 'Full-Time',
    location: 'Chennai / Tenkasi',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'React', 'Data Structures'],
    eligibleCount: 145,
    matchingCount: 94,
    status: 'Published to Campus',
    approvedByInstitution: true,
    publishedAt: '2026-08-25',
    description: 'Architect low-latency enterprise features for Zoho CRM serving over 80 million global users.'
  },
  {
    id: 'opp_hack_01',
    companyName: 'Cognitive Nexus & AWS',
    title: 'GenAI National Hackathon Challenge 2026',
    type: 'Hackathon',
    stipend: '₹5,00,000 Prize Pool + Interview Invites',
    duration: '48 Hours (Sept 18-20)',
    location: 'Online / Campus Finals',
    requiredSkills: ['Python', 'LLMs', 'LangChain', 'FastAPI'],
    eligibleCount: 195,
    matchingCount: 112,
    status: 'Pending Institution Approval',
    approvedByInstitution: false,
    publishedAt: '2026-09-02',
    description: 'State-wide competition to build multilingual societal AI assistants on Amazon Bedrock.'
  },
  {
    id: 'opp_train_01',
    companyName: 'Bosch Engineering',
    title: 'Industry Embedded RTOS Certification Training',
    type: 'Industry Training',
    stipend: 'Free Industry Sponsorship',
    duration: '4 Weeks',
    location: 'Hybrid Campus Lab',
    requiredSkills: ['C++', 'Embedded Systems', 'Microcontrollers'],
    eligibleCount: 78,
    matchingCount: 42,
    status: 'Pending Institution Approval',
    approvedByInstitution: false,
    publishedAt: '2026-09-03',
    description: 'Hands-on automotive sensor diagnostics, CAN bus interfaces, and FreeRTOS firmware design.'
  }
];

// ─── 4. SKILL GAP INTELLIGENCE MATRIX (INSTITUTION VS INDUSTRY) ───────────────
export const SKILL_GAP_MATRIX = [
  {
    skill: 'Python',
    studentLevel: 82,
    companyDemand: 90,
    gap: 8,
    severity: 'Low',
    priority: 'Maintenance',
    affectedStudents: 42,
    recommendation: 'Keep active LeetCode & DSA weekly sprints.'
  },
  {
    skill: 'SQL & Database Design',
    studentLevel: 76,
    companyDemand: 85,
    gap: 9,
    severity: 'Low',
    priority: 'Moderate',
    affectedStudents: 58,
    recommendation: 'Add complex subquery and indexing exercises to DBMS labs.'
  },
  {
    skill: 'Cloud & AWS / Azure Architecture',
    studentLevel: 35,
    companyDemand: 78,
    gap: 43,
    severity: 'Critical',
    priority: 'URGENT',
    affectedStudents: 184,
    recommendation: 'Launch Cloud & AWS certification training for CSE & IT cohorts (+16% readiness improvement).'
  },
  {
    skill: 'Generative AI & LLMOps',
    studentLevel: 41,
    companyDemand: 84,
    gap: 43,
    severity: 'Critical',
    priority: 'URGENT',
    affectedStudents: 196,
    recommendation: 'Launch Generative AI & LLM Engineering curriculum for AI & DS, CSE cohorts (+18% readiness improvement).'
  },
  {
    skill: 'Cybersecurity & Secure Coding',
    studentLevel: 58,
    companyDemand: 69,
    gap: 11,
    severity: 'Medium',
    priority: 'Moderate',
    affectedStudents: 82,
    recommendation: 'Offer OWASP Top 10 hands-on micro-credentials in Web Dev track.'
  },
  {
    skill: 'DevOps, Docker & Kubernetes',
    studentLevel: 44,
    companyDemand: 82,
    gap: 38,
    severity: 'Critical',
    priority: 'URGENT',
    affectedStudents: 148,
    recommendation: 'Introduce Containerization & CI/CD deployment sprint across 6th Semester cohorts.'
  }
];

// ─── 5. COURSE & TRAINING RECOMMENDATIONS (CLOSED LOOP) ──────────────────────
export const INITIAL_TRAINING_PROGRAMS = [
  {
    id: 'tr_01',
    code: 'NEXUS-TR-GENAI',
    title: 'Generative AI & LLM Engineering',
    category: 'AI / Emerging Tech',
    triggerGap: 'Industry Demand 84% vs Campus Proficiency 41% (Critical Gap: -43%)',
    targetCohorts: ['B.Tech CSE', 'B.Tech IT', 'B.Tech AI & Data Science'],
    targetBatch: '2026 Batch (Sem 6)',
    targetStudentCount: 184,
    expectedReadinessGain: '+18.4%',
    duration: '6 Weeks (Self-Paced + Weekend Mentor Clinics)',
    modules: ['Transformers & Tokenization', 'LangChain & LlamaIndex RAG', 'Vector DBs (Pinecone/Chroma)', 'Fine-Tuning & Evaluation', 'LLMOps with vLLM'],
    status: 'Recommended by AI',
    enrolledStudents: 0
  },
  {
    id: 'tr_02',
    code: 'NEXUS-TR-CLOUD',
    title: 'Cloud & AWS Solutions Architecture',
    category: 'Cloud & Infrastructure',
    triggerGap: 'Industry Demand 78% vs Campus Proficiency 35% (Critical Gap: -43%)',
    targetCohorts: ['B.Tech CSE', 'B.Tech IT'],
    targetBatch: '2026 Batch (Sem 6)',
    targetStudentCount: 162,
    expectedReadinessGain: '+16.2%',
    duration: '5 Weeks',
    modules: ['VPC & Cloud Networking', 'EC2, S3 & IAM Security', 'Serverless Lambda & API Gateway', 'Dockerized ECS & EKS', 'AWS Well-Architected Framework'],
    status: 'Recommended by AI',
    enrolledStudents: 0
  },
  {
    id: 'tr_03',
    code: 'NEXUS-TR-DEVOPS',
    title: 'DevOps, Docker & Container Orchestration',
    category: 'DevOps & Tooling',
    triggerGap: 'Industry Demand 82% vs Campus Proficiency 44% (Critical Gap: -38%)',
    targetCohorts: ['B.Tech CSE', 'B.Tech IT'],
    targetBatch: '2025 & 2026 Batch',
    targetStudentCount: 148,
    expectedReadinessGain: '+14.5%',
    duration: '4 Weeks',
    modules: ['Dockerfile Multi-stage Builds', 'Docker Compose Microservices', 'GitHub Actions CI/CD Pipeline', 'Kubernetes Pods & Ingress', 'Prometheus & Grafana Monitoring'],
    status: 'Active (Cohort Enrolled)',
    enrolledStudents: 148
  }
];

// ─── 6. PLACEMENT PIPELINE & RECRUITMENT FUNNEL ──────────────────────────────
export const PLACEMENT_FUNNELS = [
  {
    company: 'Google India',
    eligible: 120,
    applied: 86,
    shortlisted: 34,
    interviewed: 12,
    selected: 5,
    joined: 5,
    topRole: 'Associate Software Engineer (₹38.5 LPA)',
    status: 'Interview Round 2 Ongoing'
  },
  {
    company: 'Zoho Corporation',
    eligible: 160,
    applied: 110,
    shortlisted: 45,
    interviewed: 18,
    selected: 8,
    joined: 8,
    topRole: 'Product Developer (₹14.0 LPA)',
    status: 'Offers Dispatched'
  },
  {
    company: 'TechCorp Global Systems',
    eligible: 140,
    applied: 98,
    shortlisted: 42,
    interviewed: 22,
    selected: 14,
    joined: 12,
    topRole: 'Full Stack & Data Analyst (₹12.5 LPA)',
    status: 'Technical Assessment Complete'
  },
  {
    company: 'Infosys (SpringBoard Campus)',
    eligible: 310,
    applied: 240,
    shortlisted: 115,
    interviewed: 64,
    selected: 38,
    joined: 35,
    topRole: 'Specialist Programmer (₹9.5 LPA)',
    status: 'Final HR Rounds'
  },
  {
    company: 'Bosch Engineering',
    eligible: 94,
    applied: 62,
    shortlisted: 28,
    interviewed: 14,
    selected: 6,
    joined: 6,
    topRole: 'Embedded Software Engineer (₹11.0 LPA)',
    status: 'Offer Accepted'
  }
];

// ─── 7. INSTITUTION ALERTS ──────────────────────────────────────────────────
export const INITIAL_INSTITUTION_ALERTS = [
  {
    id: 'alt_01',
    type: 'critical',
    severity: '🔴 Critical Skill Gap',
    title: 'Cloud Skills Deficit in CSE Cohort',
    message: 'Only 35% of B.Tech CSE students possess verified Cloud skills, while 78% of visiting partner companies require AWS/Azure proficiency.',
    actionLabel: 'Launch Cloud Curriculum',
    actionRoute: 'institution-courses',
    timestamp: '10 mins ago',
    unread: true
  },
  {
    id: 'alt_02',
    type: 'opportunity',
    severity: '🟡 Recruitment Opportunity',
    title: '128 Students Match Software Engineer Opening',
    message: 'Microsoft & Zoho have opened 37 combined junior roles. 128 campus students exceed the 80% competency threshold.',
    actionLabel: 'View Matching Roster',
    actionRoute: 'institution-matching',
    timestamp: '1 hour ago',
    unread: true
  },
  {
    id: 'alt_03',
    type: 'success',
    severity: '🟢 Cohort Ready',
    title: 'AI & DS 2026 Reached 84.2% Average Readiness',
    message: 'Department benchmark surpassed state average by +14.6%. Top competency achieved in Deep Learning and NLP tracks.',
    actionLabel: 'Inspect Cohort Telemetry',
    actionRoute: 'institution-console',
    timestamp: '3 hours ago',
    unread: false
  },
  {
    id: 'alt_04',
    type: 'recommendation',
    severity: '🔵 Training Recommendation',
    title: 'Industry Demand for LLMs Surged +42%',
    message: 'AI skill telemetry signals critical market surge. Recommended action: Auto-enroll 184 eligible students in Generative AI & LLM Engineering program.',
    actionLabel: 'Enroll Cohort Now',
    actionRoute: 'institution-courses',
    timestamp: '5 hours ago',
    unread: true
  }
];

// ─── HELPER FUNCTIONS & REACTIVE LOCALSTORAGE ACCESSORS ───────────────────────

export function getInstitutionStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load institution students', e);
  }
  return INITIAL_INSTITUTION_STUDENTS;
}

export function saveInstitutionStudents(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('nexus_institution_students_changed', { detail: list }));
  } catch (e) {
    console.error('Failed to save institution students', e);
  }
}

export function getInstitutionOpportunities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load opportunities', e);
  }
  return INITIAL_OPPORTUNITIES;
}

export function saveInstitutionOpportunities(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('nexus_institution_opportunities_changed', { detail: list }));
  } catch (e) {
    console.error('Failed to save opportunities', e);
  }
}

export function approveAndPublishOpportunity(oppId) {
  const list = getInstitutionOpportunities().map(opp => {
    if (opp.id === oppId) {
      return {
        ...opp,
        status: 'Published to Campus',
        approvedByInstitution: true,
        publishedAt: new Date().toISOString().split('T')[0]
      };
    }
    return opp;
  });
  saveInstitutionOpportunities(list);
  return list;
}

export function getInstitutionCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load institution courses', e);
  }
  return INITIAL_TRAINING_PROGRAMS;
}

export function saveInstitutionCourses(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('nexus_institution_courses_changed', { detail: list }));
  } catch (e) {
    console.error('Failed to save courses', e);
  }
}

export function enrollCohortInCourse(courseId) {
  const list = getInstitutionCourses().map(c => {
    if (c.id === courseId) {
      return {
        ...c,
        status: 'Active (Cohort Enrolled)',
        enrolledStudents: c.targetStudentCount
      };
    }
    return c;
  });
  saveInstitutionCourses(list);
  return list;
}

export function getInstitutionAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load alerts', e);
  }
  return INITIAL_INSTITUTION_ALERTS;
}

// ─── 8. STUDENT-COMPANY MATCHING ENGINE ───────────────────────────────────────
export function calculateStudentCompanyMatch(student, job) {
  if (!student || !job) return { score: 70, status: 'Strong', matched: [], missing: [], rationale: '' };

  const studentSkills = (student.registeredSkills || []).map(s => s.toLowerCase());
  const required = (job.requiredSkills || []).map(s => s.toLowerCase());

  const matched = [];
  const missing = [];

  required.forEach(req => {
    const isFound = studentSkills.some(stk => stk.includes(req) || req.includes(stk));
    if (isFound) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const skillCoverage = required.length > 0 ? (matched.length / required.length) * 60 : 40;
  const readinessContribution = ((student.careerReadinessScore || 75) / 100) * 40;
  const totalScore = Math.min(99, Math.round(skillCoverage + readinessContribution));

  let status = '🔴 Gap';
  let badgeColor = 'var(--cyber-rose)';
  if (totalScore >= 90) {
    status = '🟢 Excellent';
    badgeColor = 'var(--cyber-emerald)';
  } else if (totalScore >= 78) {
    status = '🟢 Strong';
    badgeColor = 'var(--cyber-cyan)';
  } else if (totalScore >= 65) {
    status = '🟡 Potential';
    badgeColor = 'var(--cyber-amber)';
  }

  const rationale = `${student.name} matches ${matched.length} of ${required.length} required skills (${matched.join(', ')}). Academic CGPA of ${student.cgpa} and verified readiness of ${student.careerReadinessScore}% provide strong competency backing. Missing skills: ${missing.length > 0 ? missing.join(', ') : 'None'}.`;

  return {
    score: totalScore,
    status,
    badgeColor,
    matched,
    missing,
    rationale,
    readiness: student.careerReadinessScore || 75
  };
}
