const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'backend', 'data', 'relational_db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Ensure Partnered Colleges exist
const newColleges = [
  {
    institutionId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    collegeCode: 'VCET-ERD-01',
    state: 'Tamil Nadu',
    district: 'Erode',
    nirfRank: 84,
    naacGrade: 'A+',
    studentCount: 3850,
    placementRate: '94.2%',
    established: 2001
  },
  {
    institutionId: 'TN030',
    collegeName: 'PSG College of Technology',
    collegeCode: 'PSG-CBE-01',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    nirfRank: 53,
    naacGrade: 'A++',
    studentCount: 4200,
    placementRate: '98.1%',
    established: 1951
  },
  {
    institutionId: 'TN050',
    collegeName: 'Sri Krishna College of Engineering and Technology',
    collegeCode: 'SKCET-CBE-02',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    nirfRank: 77,
    naacGrade: 'A',
    studentCount: 3600,
    placementRate: '93.5%',
    established: 1997
  },
  {
    institutionId: 'TN060',
    collegeName: 'Kongu Engineering College',
    collegeCode: 'KEC-PER-01',
    state: 'Tamil Nadu',
    district: 'Erode',
    nirfRank: 99,
    naacGrade: 'A++',
    studentCount: 4100,
    placementRate: '92.8%',
    established: 1984
  },
  {
    institutionId: 'TN070',
    collegeName: 'KSG Institute of Technology',
    collegeCode: 'KSG-CBE-03',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    nirfRank: 142,
    naacGrade: 'A',
    studentCount: 2200,
    placementRate: '88.4%',
    established: 2008
  }
];

newColleges.forEach(col => {
  const existingIdx = data.institutions.findIndex(i => i.institutionId === col.institutionId || i.collegeName === col.collegeName);
  if (existingIdx >= 0) {
    data.institutions[existingIdx] = { ...data.institutions[existingIdx], ...col };
  } else {
    data.institutions.push(col);
  }
});

// 2. Candidate Profiles matching prompt
const primaryCandidates = [
  {
    studentId: 'STU-VCET-001',
    regNo: '732922104001',
    name: 'Arun Kumar',
    email: 'arun.kumar@vcet.edu.in',
    phone: '+91 98421 78210',
    collegeId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    department: 'CSE',
    year: '3rd Year',
    semester: 'Sem 6',
    cgpa: '8.94',
    backlogs: 0,
    headline: 'B.Tech CSE • Full Stack & React Developer • AI Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    readinessScore: 92,
    aiMatchScore: 94,
    courseProgress: 89,
    certificatesCount: 8,
    careerGoal: 'Full Stack Engineer & AI Systems Architect',
    placementStatus: 'Job Ready',
    preferredRoles: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer'],
    skills: [
      { name: 'React', level: 'Advanced', confidence: 95, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, evidence: '4 verified PRs, Redux architecture' },
      { name: 'Next.js', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, evidence: 'SSR deployment with Vercel edge runtime' },
      { name: 'Python', level: 'Advanced', confidence: 92, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, evidence: 'FastAPI async pipeline & PyTorch' },
      { name: 'Java', level: 'Intermediate', confidence: 84, verified: true, hasAssessment: true, hasCourse: true, hasProject: false, evidence: 'Spring Boot microservices diagnostics' },
      { name: 'SQL', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, evidence: 'Complex PostgreSQL indexing & schema tuning' },
      { name: 'MongoDB', level: 'Intermediate', confidence: 82, verified: true, hasAssessment: false, hasCourse: true, hasProject: true, evidence: 'Aggregation pipeline optimizations' },
      { name: 'Git', level: 'Advanced', confidence: 96, verified: true, hasAssessment: true, hasCourse: true, hasProject: true, evidence: '180+ verified git commits on ledger' },
      { name: 'AWS', level: 'Intermediate', confidence: 75, verified: true, hasAssessment: false, hasCourse: true, hasProject: true, evidence: 'S3, Lambda, CloudFront deployments' },
      { name: 'TypeScript', level: 'Intermediate', confidence: 72, verified: false, hasAssessment: false, hasCourse: true, hasProject: true, evidence: 'Strict typing refactor' }
    ],
    readinessBreakdown: {
      technicalSkills: 85,
      projects: 90,
      certificates: 82,
      communication: 80,
      interviewReadiness: 75
    },
    courseProgressList: [
      { name: 'Full Stack Development', progress: 85, status: 'Active' },
      { name: 'Python Programming', progress: 100, status: 'Completed' },
      { name: 'Cloud Computing', progress: 65, status: 'Active' },
      { name: 'AI/ML Fundamentals', progress: 48, status: 'Active' }
    ],
    projectsList: [
      {
        id: 'PRJ-VCET-01',
        title: 'E-Commerce Web Application',
        technologies: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
        description: 'Scalable multi-tenant e-commerce platform with SSR, automated cart synchronization, and Stripe checkout.',
        github: 'https://github.com/arunkumar/nexus-ecommerce',
        liveDemo: 'https://ecommerce-nexus.vercel.app',
        verified: true,
        verificationStatus: 'Verified',
        proofHash: '0x89ab12cd34ef5678'
      },
      {
        id: 'PRJ-VCET-02',
        title: 'AI Career Assistant',
        technologies: ['React', 'FastAPI', 'Python', 'LangChain', 'ChromaDB'],
        description: 'RAG-driven resume and career guidance agent synthesizing student portfolio artifacts with enterprise job descriptions.',
        github: 'https://github.com/arunkumar/ai-career-assistant',
        liveDemo: 'https://ai-career-nexus.io',
        verified: true,
        verificationStatus: 'Verified',
        proofHash: '0x34bc78de90fa1234'
      },
      {
        id: 'PRJ-VCET-03',
        title: 'Predictive Maintenance ML',
        technologies: ['Python', 'Scikit-Learn', 'FastAPI', 'Docker'],
        description: 'Industrial IoT predictive maintenance pipeline monitoring sensor vibrational anomalies in real time.',
        github: 'https://github.com/arunkumar/predictive-maintenance-ml',
        liveDemo: 'https://pred-maint.internal.dev',
        verified: true,
        verificationStatus: 'Verified',
        proofHash: '0x99ef43cd12ab8765'
      },
      {
        id: 'PRJ-VCET-04',
        title: 'Campus Management System',
        technologies: ['React', 'Tailwind', 'Node.js', 'MongoDB'],
        description: 'Automated campus attendance, timetable scheduling, and hall-ticket distribution portal used by 2,000+ students.',
        github: 'https://github.com/arunkumar/campus-management',
        liveDemo: 'https://campus-vcet.edu.in',
        verified: true,
        verificationStatus: 'Verified',
        proofHash: '0x55aa66bb77cc88dd'
      }
    ],
    certifications: [
      { title: 'Full Stack Web Architecture', issuer: 'Nexus AI Academy', date: '2026-07-20', credentialId: 'NX-9102-REACT', verified: true },
      { title: 'Python for Data Science & ML', issuer: 'Coursera & VCET CoE', date: '2026-05-14', credentialId: 'CR-PY-8841', verified: true },
      { title: 'AWS Cloud Practitioner Essentials', issuer: 'Amazon Web Services', date: '2026-04-10', credentialId: 'AWS-CP-7719', verified: true },
      { title: 'Algorithmic Problem Solving in Java', issuer: 'HackerRank Gold', date: '2026-03-02', credentialId: 'HK-JAVA-3021', verified: true },
      { title: 'Modern React & State Patterns', issuer: 'Meta Frontend Cert', date: '2026-02-18', credentialId: 'META-REACT-4190', verified: true },
      { title: 'PostgreSQL Enterprise Tuning', issuer: 'EnterpriseDB Academy', date: '2026-01-25', credentialId: 'EDB-SQL-1102', verified: true },
      { title: 'Docker Containers in Production', issuer: 'Docker Certified', date: '2025-11-30', credentialId: 'DCK-PROD-9812', verified: true },
      { title: 'Git Pro & CI/CD Workflows', issuer: 'GitHub Campus', date: '2025-10-15', credentialId: 'GH-CICD-5401', verified: true }
    ],
    timeline: [
      { type: 'Internship', title: 'Frontend Developer Intern @ TechWave', date: 'Jun 2026 - Aug 2026', details: 'Built React component system with 100% test coverage.' },
      { type: 'Hackathon', title: '1st Place — Smart India Hackathon Regional', date: 'Apr 2026', details: 'Developed AI talent matching algorithm for universities.' },
      { type: 'Certificate', title: 'Full Stack Web Architecture Certification', date: 'Jul 2026', details: 'Credential ID NX-9102-REACT cryptographically verified.' },
      { type: 'Project', title: 'Deployed E-Commerce Web Application', date: 'May 2026', details: 'Completed production deployment with Stripe and PostgreSQL.' },
      { type: 'Assessment', title: 'NEXUS Proctored Code Diagnostic (Score: 94%)', date: 'Mar 2026', details: 'Ranked in top 6th percentile in algorithms and system design.' },
      { type: 'Course', title: 'Python Programming Masterclass Completed', date: 'Jan 2026', details: '100% curriculum completion and faculty verification.' }
    ]
  },
  {
    studentId: 'STU-VCET-002',
    regNo: '732922205012',
    name: 'Priya Dhanushri',
    email: 'priya.dhanushri@vcet.edu.in',
    phone: '+91 97890 23412',
    collegeId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    department: 'IT',
    year: '3rd Year',
    semester: 'Sem 6',
    cgpa: '9.12',
    backlogs: 0,
    headline: 'B.Tech IT • Cloud & Distributed Systems • Microservices',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    readinessScore: 88,
    aiMatchScore: 92,
    courseProgress: 90,
    certificatesCount: 6,
    careerGoal: 'Cloud Platform Engineer & Backend Specialist',
    placementStatus: 'Job Ready',
    preferredRoles: ['Cloud DevOps Intern', 'Backend Developer', 'Software Engineer'],
    skills: [
      { name: 'React', level: 'Intermediate', confidence: 88, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Node.js', level: 'Advanced', confidence: 92, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Docker', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'AWS', level: 'Intermediate', confidence: 85, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Python', level: 'Intermediate', confidence: 84, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Kubernetes', level: 'Intermediate', confidence: 78, verified: true, hasAssessment: false, hasCourse: true, hasProject: true }
    ],
    readinessBreakdown: {
      technicalSkills: 88,
      projects: 86,
      certificates: 85,
      communication: 90,
      interviewReadiness: 82
    },
    courseProgressList: [
      { name: 'Distributed Systems & Cloud Architecture', progress: 95, status: 'Completed' },
      { name: 'Docker & Kubernetes Mastery', progress: 90, status: 'Active' },
      { name: 'Backend Microservices with Node.js', progress: 88, status: 'Active' }
    ],
    projectsList: [
      {
        id: 'PRJ-VCET-11',
        title: 'Distributed Event Queue with Redis',
        technologies: ['Node.js', 'Redis', 'Docker', 'AWS'],
        description: 'Fault-tolerant job scheduling queue processing 10k events/sec with automated dead-letter retries.',
        github: 'https://github.com/priyadhanushri/event-queue-redis',
        liveDemo: 'https://queue-telemetry.dev',
        verified: true,
        verificationStatus: 'Verified'
      }
    ],
    certifications: [
      { title: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', date: '2026-06-18', credentialId: 'AWS-SAA-9012', verified: true },
      { title: 'Docker Certified Associate (DCA)', issuer: 'Mirantis', date: '2026-04-20', credentialId: 'DCA-8812-PR', verified: true },
      { title: 'Node.js Application Developer', issuer: 'OpenJS Foundation', date: '2026-02-14', credentialId: 'JS-NODE-4091', verified: true }
    ],
    timeline: [
      { type: 'Internship', title: 'DevOps Intern @ CloudScale Systems', date: 'May 2026 - Jul 2026', details: 'Containerized legacy monoliths into ECS Fargate services.' }
    ]
  },
  {
    studentId: 'STU-VCET-003',
    regNo: '732922106024',
    name: 'Karthik Raja',
    email: 'karthik.raja@vcet.edu.in',
    phone: '+91 94432 99881',
    collegeId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    department: 'AI & DS',
    year: '3rd Year',
    semester: 'Sem 6',
    cgpa: '8.86',
    backlogs: 0,
    headline: 'B.Tech AI & Data Science • Deep Learning & Vector Search',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    readinessScore: 85,
    aiMatchScore: 90,
    courseProgress: 86,
    certificatesCount: 5,
    careerGoal: 'Machine Learning Research Engineer',
    placementStatus: 'Job Ready',
    preferredRoles: ['AI/ML Engineer', 'Data Analyst Intern', 'Data Scientist'],
    skills: [
      { name: 'Python', level: 'Advanced', confidence: 94, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'PyTorch', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'FastAPI', level: 'Intermediate', confidence: 85, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'LangChain', level: 'Intermediate', confidence: 88, verified: true, hasAssessment: false, hasCourse: true, hasProject: true },
      { name: 'SQL', level: 'Intermediate', confidence: 82, verified: true, hasAssessment: true, hasCourse: true, hasProject: true }
    ],
    readinessBreakdown: {
      technicalSkills: 90,
      projects: 88,
      certificates: 80,
      communication: 78,
      interviewReadiness: 76
    },
    courseProgressList: [
      { name: 'Deep Learning & Transformer Networks', progress: 92, status: 'Active' },
      { name: 'MLOps Pipeline Deployment', progress: 80, status: 'Active' }
    ],
    projectsList: [
      {
        id: 'PRJ-VCET-21',
        title: 'Multi-Modal RAG Knowledge Assistant',
        technologies: ['PyTorch', 'LangChain', 'FastAPI', 'ChromaDB'],
        description: 'Semantic vector search engine parsing PDFs, charts, and technical manuals for engineering departments.',
        github: 'https://github.com/karthikraja/multimodal-rag',
        liveDemo: 'https://rag-search.internal.dev',
        verified: true,
        verificationStatus: 'Verified'
      }
    ],
    certifications: [
      { title: 'TensorFlow Developer Certificate', issuer: 'Google AI', date: '2026-05-11', credentialId: 'TF-DEV-9902', verified: true },
      { title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: '2026-03-15', credentialId: 'DL-AI-3301', verified: true }
    ],
    timeline: [
      { type: 'Project', title: 'Published Multi-Modal RAG Paper', date: 'Jun 2026', details: 'Presented at National AI & Data Science Symposium.' }
    ]
  },
  {
    studentId: 'STU-VCET-004',
    regNo: '732923104033',
    name: 'Deepika S',
    email: 'deepika.s@vcet.edu.in',
    phone: '+91 96291 44552',
    collegeId: 'TN040',
    collegeName: 'Velalar College of Engineering and Technology',
    department: 'CSE',
    year: '2nd Year',
    semester: 'Sem 4',
    cgpa: '9.28',
    backlogs: 0,
    headline: 'B.Tech CSE • Algorithmic Design & React Frontend Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    readinessScore: 80,
    aiMatchScore: 88,
    courseProgress: 82,
    certificatesCount: 4,
    careerGoal: 'Frontend Engineer & UI Systems Designer',
    placementStatus: 'Internship Ready',
    preferredRoles: ['Frontend Developer Intern', 'Software Engineer'],
    skills: [
      { name: 'React', level: 'Intermediate', confidence: 86, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'JavaScript', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'HTML/CSS', level: 'Advanced', confidence: 95, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Python', level: 'Intermediate', confidence: 80, verified: true, hasAssessment: true, hasCourse: true, hasProject: false }
    ],
    readinessBreakdown: {
      technicalSkills: 80,
      projects: 82,
      certificates: 75,
      communication: 88,
      interviewReadiness: 72
    },
    courseProgressList: [
      { name: 'Modern Web Development with React', progress: 88, status: 'Active' },
      { name: 'Data Structures & Algorithms in C++', progress: 95, status: 'Completed' }
    ],
    projectsList: [
      {
        id: 'PRJ-VCET-31',
        title: 'Collaborative Code Playground',
        technologies: ['React', 'WebSockets', 'Tailwind', 'Monaco Editor'],
        description: 'Real-time pair programming sandbox with live syntax highlighting and execution engine.',
        github: 'https://github.com/deepikas/code-playground',
        liveDemo: 'https://codeplay.dev',
        verified: true,
        verificationStatus: 'Verified'
      }
    ],
    certifications: [
      { title: 'Frontend Developer Certificate', issuer: 'Meta Career Cert', date: '2026-06-01', credentialId: 'META-FE-7721', verified: true }
    ],
    timeline: [
      { type: 'Hackathon', title: 'Top 5 Finalist — VCET Innovate 2026', date: 'May 2026', details: 'Built interactive educational canvas for school students.' }
    ]
  }
];

primaryCandidates.forEach(cand => {
  const existingIdx = data.students.findIndex(s => s.studentId === cand.studentId || s.name === cand.name);
  if (existingIdx >= 0) {
    data.students[existingIdx] = { ...data.students[existingIdx], ...cand };
  } else {
    data.students.push(cand);
  }
});

// 3. Ensure Opportunities exist for ABC Technologies / COMP-001
const targetOpps = [
  {
    oppId: 'OPP-001',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    title: 'Frontend Developer Intern',
    type: 'Internship',
    mode: 'Hybrid',
    location: 'Chennai, Tamil Nadu (OMR IT Expressway)',
    department: 'Frontend & UI Engineering',
    stipend: '₹35,000 / month',
    duration: '6 Months (Convertible)',
    minCgpa: '7.5',
    minProgress: 80,
    minMatch: 80,
    deadline: 'October 15, 2026',
    requiredSkills: ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Git'],
    description: 'Join our flagship SaaS engineering squad to build responsive, micro-frontend user interfaces with state-of-the-art AI interactions.',
    applicantCount: 24,
    shortlistedCount: 6,
    positions: 4,
    selectionProcess: 'Resume Evidence Screening → Proctored Code Diagnostic → Technical Interview',
    status: 'ACTIVE'
  },
  {
    oppId: 'OPP-002',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    title: 'AI/ML Engineer',
    type: 'Full-Time',
    mode: 'Hybrid',
    location: 'Chennai / Bengaluru',
    department: 'AI & Data Systems',
    stipend: '₹65,000 / month (12 LPA)',
    duration: 'Full-Time',
    minCgpa: '8.0',
    minProgress: 85,
    minMatch: 85,
    deadline: 'October 30, 2026',
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'SQL'],
    description: 'Design and deploy production-scale RAG pipelines, fine-tune transformer models, and optimize inference throughput for enterprise clients.',
    applicantCount: 38,
    shortlistedCount: 8,
    positions: 3,
    selectionProcess: 'Portfolio Review → Live Coding Task → System Architecture Round',
    status: 'ACTIVE'
  },
  {
    oppId: 'OPP-003',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    title: 'Software Engineer',
    type: 'Full-Time',
    mode: 'Onsite',
    location: 'Chennai, Tamil Nadu',
    department: 'Core Platform Engineering',
    stipend: '₹55,000 / month (10 LPA)',
    duration: 'Full-Time',
    minCgpa: '7.8',
    minProgress: 80,
    minMatch: 80,
    deadline: 'November 15, 2026',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Docker', 'AWS'],
    description: 'Architect distributed backend services, optimize SQL query execution plans, and build scalable microservices for financial clients.',
    applicantCount: 45,
    shortlistedCount: 12,
    positions: 5,
    selectionProcess: 'Coding Assessment → Technical Discussion → HR Interview',
    status: 'ACTIVE'
  },
  {
    oppId: 'OPP-004',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    title: 'Data Analyst Intern',
    type: 'Internship',
    mode: 'Remote',
    location: 'Remote (India)',
    department: 'Business Intelligence & Telemetry',
    stipend: '₹30,000 / month',
    duration: '3 Months',
    minCgpa: '7.2',
    minProgress: 75,
    minMatch: 75,
    deadline: 'October 20, 2026',
    requiredSkills: ['Python', 'SQL', 'Power BI', 'FastAPI'],
    description: 'Analyze telemetry streams, build automated executive dashboards, and extract actionable student readiness insights.',
    applicantCount: 19,
    shortlistedCount: 4,
    positions: 2,
    selectionProcess: 'SQL Diagnostic → Take-Home Dashboard Assignment → Interview',
    status: 'ACTIVE'
  },
  {
    oppId: 'OPP-005',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    title: 'Cloud DevOps Apprentice',
    type: 'Apprenticeship',
    mode: 'Hybrid',
    location: 'Chennai (OMR Campus)',
    department: 'Cloud Infrastructure',
    stipend: '₹28,000 / month',
    duration: '12 Months',
    minCgpa: '7.0',
    minProgress: 70,
    minMatch: 70,
    deadline: 'November 05, 2026',
    requiredSkills: ['Docker', 'Linux', 'AWS', 'Python', 'Git'],
    description: 'National apprenticeship program providing hands-on training with CI/CD automation, cloud infrastructure, and Kubernetes orchestration.',
    applicantCount: 16,
    shortlistedCount: 5,
    positions: 4,
    selectionProcess: 'Linux Fundamentals Test → Culture Fit Discussion',
    status: 'ACTIVE'
  }
];

targetOpps.forEach(opp => {
  const existingIdx = data.opportunities.findIndex(o => o.oppId === opp.oppId);
  if (existingIdx >= 0) {
    data.opportunities[existingIdx] = { ...data.opportunities[existingIdx], ...opp };
  } else {
    data.opportunities.push(opp);
  }
});

// 4. Ensure Applications exist for COMP-001
const targetApps = [
  {
    applicationId: 'APP-VCET-001',
    studentId: 'STU-VCET-001',
    studentName: 'Arun Kumar',
    studentCollegeId: 'TN040',
    studentCollegeName: 'Velalar College of Engineering and Technology',
    studentDepartment: 'CSE',
    opportunityId: 'OPP-001',
    opportunityTitle: 'Frontend Developer Intern',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    matchScore: 94,
    stage: 'Interview',
    appliedAt: '2026-09-02T10:15:00.000Z',
    updatedAt: '2026-09-04T14:30:00.000Z',
    recruiterNotes: 'Exceptional React and Next.js portfolio. Passed initial screening with 96% score.'
  },
  {
    applicationId: 'APP-VCET-002',
    studentId: 'STU-VCET-002',
    studentName: 'Priya Dhanushri',
    studentCollegeId: 'TN040',
    studentCollegeName: 'Velalar College of Engineering and Technology',
    studentDepartment: 'IT',
    opportunityId: 'OPP-001',
    opportunityTitle: 'Frontend Developer Intern',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    matchScore: 92,
    stage: 'Shortlisted',
    appliedAt: '2026-09-03T11:45:00.000Z',
    updatedAt: '2026-09-04T15:20:00.000Z',
    recruiterNotes: 'Strong cloud architecture experience. Verified microservices proof on ledger.'
  },
  {
    applicationId: 'APP-VCET-003',
    studentId: 'STU-VCET-003',
    studentName: 'Karthik Raja',
    studentCollegeId: 'TN040',
    studentCollegeName: 'Velalar College of Engineering and Technology',
    studentDepartment: 'AI & DS',
    opportunityId: 'OPP-002',
    opportunityTitle: 'AI/ML Engineer',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    matchScore: 90,
    stage: 'Under Review',
    appliedAt: '2026-09-03T16:20:00.000Z',
    updatedAt: '2026-09-04T09:10:00.000Z',
    recruiterNotes: 'Solid PyTorch research project with transformer attention models.'
  },
  {
    applicationId: 'APP-VCET-004',
    studentId: 'STU-VCET-004',
    studentName: 'Deepika S',
    studentCollegeId: 'TN040',
    studentCollegeName: 'Velalar College of Engineering and Technology',
    studentDepartment: 'CSE',
    opportunityId: 'OPP-001',
    opportunityTitle: 'Frontend Developer Intern',
    companyId: 'COMP-001',
    companyName: 'ABC Technologies',
    matchScore: 88,
    stage: 'New',
    appliedAt: '2026-09-04T18:00:00.000Z',
    updatedAt: '2026-09-04T18:00:00.000Z',
    recruiterNotes: 'High potential 2nd year student with impressive collaborative code editor.'
  }
];

targetApps.forEach(app => {
  const existingIdx = data.applications.findIndex(a => a.applicationId === app.applicationId);
  if (existingIdx >= 0) {
    data.applications[existingIdx] = { ...data.applications[existingIdx], ...app };
  } else {
    data.applications.push(app);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Database successfully enriched!');
console.log('Total institutions:', data.institutions.length);
console.log('Total students:', data.students.length);
console.log('Total opportunities:', data.opportunities.length);
console.log('Total applications:', data.applications.length);
