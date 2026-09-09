# SKILL NEXUS AI — PHASE 6 FINAL DEEP VERIFICATION
# STUDENT HOME PAGE — DO NOT ACCEPT THE CURRENT IMPLEMENTATION YET

The previous Student Home implementation reports:

verify_student_home.js = 76 / 76
frontend build = PASS

However, this is NOT sufficient to declare Student Home complete.

I need you to perform a SECOND - LEVEL FORENSIC AUDIT.

  IMPORTANT:
DO NOT simply rerun the existing 76 / 76 test and report PASS.

The current test may be testing the same implementation assumptions that were introduced during the fix.

I need proof that:

REAL LOGIN
→ REAL AUTH USER
→ REAL STUDENT
→ REAL POSTGRESQL RECORDS
→ REAL BACKEND API
→ REAL STUDENT HOME
→ REAL USER ACTION
→ DATABASE UPDATE
→ HOME REFRESH
→ UPDATED DATABASE VALUE

actually works.

============================================================
1. CRITICAL ISSUE — STUDENT IDENTITY
============================================================

Audit exactly how:

JWT user
↓
req.user
↓
studentId
↓
students.user_id
↓
students.id

is resolved.

The current implementation contains:

req.user?.studentId || req.user?.id

This is potentially dangerous.

Do NOT assume user.id === student.id.

Prove the exact database relationship.

If users.id is UUID and students.id/student_id uses another identifier:

create/reuse one canonical resolver.

The Student Dashboard must NEVER accidentally use:

user.id
as
student.id

unless the database schema proves they are identical.

Document the exact relationship.

============================================================
2. CRITICAL ISSUE — DO NOT USE RAW STUDENT OBJECTS
============================================================

Inspect:

student.skills
student.projects
student.assessments
student.certifications

Determine whether these are:

A. authoritative PostgreSQL joins
OR
B. legacy JSON-derived properties
OR
C. relationalManager compatibility objects
OR
D. frontend/demo-derived fields.

For each one show:

SOURCE TABLE
→ SQL QUERY
→ relationalManager method
→ dashboard service
→ API response.

If any value ultimately comes from relational_db.json or an in-memory mock:

FIX IT.

============================================================
3. CRITICAL ISSUE — READINESS
============================================================

There is already a known regression:

verify_portal_fixes.js
reports that a newly registered student's stored readinessScore is non-zero.

Investigate this.

There must be a strict distinction between:

STORED DATABASE readinessScore
and
COMPUTED READINESS SCORE.

A new student must compute:

0%

Do not leave a misleading non-zero readinessScore in the authoritative student state.

Determine whether readinessScore should:

A. be removed as a stored source of truth,
B. always be recalculated,
C. be synchronized correctly.

Reuse the existing readinessService.

Do NOT create a second formula.

Then rerun the relevant regression test.

============================================================
4. CRITICAL ISSUE — OPPORTUNITY MATCHING
============================================================

The dashboard implementation currently appears to calculate opportunity matches locally.

Compare this with the existing:

matchingService

The platform already has an authoritative matching layer.

DO NOT create another simplified matching algorithm inside:

studentRoutes.js

If matchingService already exists:

REUSE IT.

The Student Home opportunity recommendations must use the SAME matching logic as:

/student/opportunities

Otherwise the user can receive different match scores on:

Home
vs
Opportunities page.

Fix this inconsistency.

============================================================
5. CRITICAL ISSUE — CAPABILITY SCORING
============================================================

The dashboard currently categorizes skills using keyword arrays such as:

javascript
python
react
aws
docker
etc.

This may be acceptable as a presentation layer, but it must not become another independent skill scoring engine.

Determine whether the project already has:

skill categories
skill levels
skill analytics
skill assessment results
skill gap calculations.

Reuse the existing authoritative skill architecture.

Do NOT create a second definition of:

Technical Skills
Problem Solving
Communication
System Design
Cloud

unless these categories are explicitly part of the existing product.

If these dashboard categories are not supported by real database data:

show only supported metrics.

NEVER invent intelligence.

============================================================
6. CRITICAL ISSUE — PROJECT DATA
============================================================

Verify:

projects
project_skills
project_proofs

The dashboard must distinguish:

Total Projects
In Progress
Completed
Validated

using the actual database status model.

Do not infer project completion from random legacy fields such as:

proofVerified
status strings

unless these are the canonical database representation.

Map:

projects.id
↓
project_proofs.project_id
↓
current proof
↓
validation state.

============================================================
7. CRITICAL ISSUE — COURSE DATA
============================================================

Verify:

enrollments
course_modules
student_module_progress

The dashboard must calculate course progress from PostgreSQL.

Test:

10 modules
2 completed
→ 20%

Click Continue:
→ remains 20%

Click Complete Module:
→ 30%

Click Complete again:
→ remains 30%

Refresh:
→ remains 30%

Logout
→ Login
→ remains 30%

Do not use frontend counters.

============================================================
8. CRITICAL ISSUE — ASSESSMENTS
============================================================

Verify the difference between:

assessments
assessment_attempts
assessment_answers
assessment_results

Do not assume:

student.assessments

is the canonical assessment history.

Trace the actual schema.

For the Student Home:

Assessment count
Assessment score
Recent assessment
Readiness contribution

must come from the proper PostgreSQL records.

============================================================
9. CRITICAL ISSUE — CERTIFICATES
============================================================

Trace:

certificates
student
course
issuer

Verify that certificate count is student-specific.

Do not count certificates belonging to another student.

============================================================
10. CRITICAL ISSUE — APPLICATIONS
============================================================

Verify:

applications.student_id

and ensure:

Student A
→ only Student A applications.

Student B
→ only Student B applications.

Do not rely only on frontend filtering.

Authorization must happen server-side.

============================================================
11. CRITICAL ISSUE — INTERVIEWS
============================================================

Verify:

interviews
applications
opportunities
companies

The Home Page must show only interviews associated with the authenticated student's applications.

No hardcoded interview records.

============================================================
12. CRITICAL ISSUE — NOTIFICATIONS
============================================================

Verify:

notifications.user_id

The Home Page must query the authenticated user's notifications.

Test:

Student A receives notification
→ A sees it.

Student B logs in
→ B does not see A's notification.

============================================================
13. CRITICAL ISSUE — RECENT ACTIVITY
============================================================

The current dashboard appears to construct recent activity from multiple arrays.

Audit whether timestamps actually originate from PostgreSQL.

Do NOT create activity simply from array order.

Sort by real database timestamps.

If an event has no reliable timestamp:

do not fabricate one.

============================================================
14. CRITICAL ISSUE — THIS MONTH
============================================================

The old dashboard had:

18 Days active
42 Pages visited
06h 28m Total learning time
12 Assessments attempted

These values were fake.

Do NOT replace fake values with another fake implementation.

For each metric:

Days Active
→ determine whether login/activity tracking exists.

Pages Visited
→ determine whether page tracking exists.

Learning Time
→ determine whether learning duration is persisted.

Assessments Attempted
→ use real assessment attempts.

If tracking does not exist:

display:

Not tracked yet

or remove the metric.

Do NOT display fabricated values.

============================================================
15. CRITICAL ISSUE — ZERO STATE
============================================================

Create a truly new Student through the real registration flow.

DO NOT use:

STU-TN010-001

as the only validation student.

Create:

NEW_TEST_STUDENT

with no:

skills
projects
courses
assessments
applications
certificates
interviews
notifications

Login.

Home must show genuine zero state.

Then verify PostgreSQL directly.

Expected:

skills = 0
projects = 0
courses = 0
assessments = 0
applications = 0
certificates = 0
interviews = 0
readiness = 0

No demo information.

============================================================
16. CRITICAL ISSUE — REAL MUTATION TEST
============================================================

Use the real UI.

Do NOT directly insert database records for this test.

Perform:

Login
→ Home

Add Skill
→ save

Return Home
→ skill count changes.

Enroll Course
→ Home
→ course count changes.

Complete Module
→ Home
→ progress changes.

Submit Project
→ Home
→ project data changes.

Take Assessment
→ Home
→ assessment data changes.

Apply Opportunity
→ Home
→ application data changes.

Every change must be:

UI
→ API
→ backend
→ PostgreSQL
→ response
→ Home.

============================================================
17. CROSS-STUDENT ISOLATION
============================================================

Create:

Student A
Student B

A performs:

skill
course
project
application

Login as B.

B must see:

0 for those A-specific records.

Attempt to manipulate URL/API parameters to request A's data.

Must return:

403
or
empty authorized result.

Never expose A data.

============================================================
18. REAL DATABASE TRACE
============================================================

For every Home widget create this matrix:

| Widget | UI Component | API | Service | DB Query | Tables | Student Filter | Source |
|---|---|---|---|---|---|---|---|

There must be ZERO unknown sources.

============================================================
19. SEARCH THE ENTIRE STUDENT HOME CODE
============================================================

Search for:

mock
dummy
fake
demo
static
hardcoded
fallback
relational_db.json
localStorage
sessionStorage
72%
5 Skills
5 Projects
3 Courses
12 Opportunities
43%
Full-Stack Developer
System Design
TechNova
ABC Technologies
Data Analyst Intern
Expense Tracker
arun.kumar@nexus.edu

Classify every result.

Do not blindly delete test fixtures.

But ZERO runtime business data may depend on them.

============================================================
20. CHECK API RESPONSE AGAINST DATABASE
============================================================

For a real student:

Query PostgreSQL directly.

Then call:

GET /api/students/dashboard

Compare every metric.

Example:

PostgreSQL:
student_skills = 4

API:
skills = 4

UI:
Skills = 4

If:

DB = 4
API = 4
UI = 5

FAIL.

============================================================
21. CHECK REFRESH CONSISTENCY
============================================================

Test:

Home
↓
record action
↓
Home update
↓
browser refresh
↓
same value
↓
logout
↓
login
↓
same value.

No state may depend only on React memory.

============================================================
22. CHECK GOOGLE LOGIN
============================================================

Test the Student Home after:

Google login
↓
JWT
↓
student resolution
↓
Home

The Google-authenticated student must receive their own PostgreSQL record.

Do not use fake Google credentials for this verification.

If real Google browser verification is unavailable:

explicitly report:

NOT VERIFIED

Do not claim PASS.

============================================================
23. CHECK LOADING / ERROR / EMPTY
============================================================

Simulate:

API loading
API failure
database unavailable
student with no data.

Home must show:

Loading state
Error state
Empty state

Never fall back to demo data.

============================================================
24. PERFORMANCE
============================================================

Inspect network requests.

Report:

Number of Home API requests
Duplicate requests
N+1 queries
Failed requests
Long-running queries

Do not add unnecessary polling.

============================================================
25. DO NOT TRUST EXISTING TESTS BLINDLY
============================================================

Review the test:

verify_student_home.js

Determine whether it actually tests:

REAL HTTP request
REAL JWT
REAL PostgreSQL
REAL Student Home UI

or only calls:

relationalManager
services
helper functions.

If it is only unit/integration logic:

DO NOT describe it as complete E2E verification.

Clearly classify:

UNIT
INTEGRATION
API
BROWSER E2E

============================================================
26. FINAL TEST MATRIX
============================================================

Produce:

| Test | Type | Result | Evidence |
|---|---|---|---|
| New Student Zero State | DB/API/UI | | |
| Login | Browser/API | | |
| Dashboard API | API | | |
| Skills | UI/API/DB | | |
| Courses | UI/API/DB | | |
| Module Progress | UI/API/DB | | |
| Projects | UI/API/DB | | |
| Assessments | UI/API/DB | | |
| Opportunities | UI/API/DB | | |
| Applications | UI/API/DB | | |
| Interviews | UI/API/DB | | |
| Certificates | UI/API/DB | | |
| Notifications | UI/API/DB | | |
| Refresh | Browser | | |
| Logout/Login | Browser | | |
| Student Isolation | Security | | |
| Google Login | Browser | | |

============================================================
27. FIX ANY REAL ISSUES FOUND
============================================================

You are allowed to modify code if required.

BUT:

Reuse existing architecture.

Do not create duplicate:

services
routes
matching algorithms
readiness algorithms
student identity systems
database tables.

Do not change schema unless absolutely necessary.

If schema changes are necessary:

create a proper migration.

============================================================
28. FINAL REPORT
============================================================

Update/create:

PHASE_6_STUDENT_HOME_FINAL_FORENSIC_REPORT.md

Sections:

1. Executive Summary
2. Existing Home Architecture
3. Correct Student Login Flow
4. Canonical Student Identity
5. Home API
6. PostgreSQL Connection
7. Complete Widget → Database Mapping
8. Skills Flow
9. Learning Flow
10. Assessment Flow
11. Project Flow
12. Opportunity Flow
13. Application Flow
14. Interview Flow
15. Certificate Flow
16. Notification Flow
17. Readiness Flow
18. Matching Flow
19. Zero-State Proof
20. Student Isolation Proof
21. Mock Data Audit
22. JSON Dependency Audit
23. API Audit
24. Database Audit
25. UI Audit
26. Browser Verification
27. Regression Results
28. Remaining Bugs
29. Production Blockers
30. Recommended Next Steps

============================================================
29. FINAL STATUS MUST BE HONEST
============================================================

Use exactly one:

A — PRODUCTION READY

B — DEMO READY WITH KNOWN LIMITATIONS

C — NOT READY

Do NOT use "Production Ready" simply because:

build passes
or
76/76 tests pass.

The Student Home is only A if:

UI
→ API
→ Auth
→ Authorization
→ Service
→ PostgreSQL
→ Response
→ UI

has been proven end-to-end.

BEGIN THE SECOND-LEVEL FORENSIC AUDIT NOW.

DO NOT JUST REPEAT THE PREVIOUS PASS REPORT.const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'backend', 'data', 'relational_db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const moreStudents = [
  {
    studentId: 'STU-PSG-001',
    regNo: '21L101',
    name: 'Sanjay M',
    email: 'sanjay.m@psgtech.ac.in',
    phone: '+91 94881 12345',
    collegeId: 'TN030',
    collegeName: 'PSG College of Technology',
    department: 'ECE',
    year: '4th Year',
    semester: 'Sem 8',
    cgpa: '9.35',
    backlogs: 0,
    headline: 'B.E ECE • Embedded IoT & Edge AI • C++ / Python',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    readinessScore: 95,
    aiMatchScore: 91,
    courseProgress: 94,
    certificatesCount: 7,
    careerGoal: 'Embedded Systems & Edge Computing Engineer',
    placementStatus: 'Job Ready',
    preferredRoles: ['Software Engineer', 'Embedded Engineer'],
    skills: [
      { name: 'C++', level: 'Advanced', confidence: 96, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Python', level: 'Advanced', confidence: 90, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Linux', level: 'Advanced', confidence: 92, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Docker', level: 'Intermediate', confidence: 80, verified: true, hasAssessment: false, hasCourse: true, hasProject: true }
    ],
    readinessBreakdown: { technicalSkills: 94, projects: 95, certificates: 90, communication: 86, interviewReadiness: 92 },
    courseProgressList: [{ name: 'Edge AI on ARM Cortex', progress: 95, status: 'Completed' }],
    projectsList: [{ id: 'PRJ-PSG-01', title: 'Edge Video Analytics with TensorRT', technologies: ['C++', 'CUDA', 'Python'], description: 'Real-time vehicle detection at 60 FPS on Jetson Nano.', github: 'https://github.com/sanjaym/edge-video', liveDemo: '', verified: true, verificationStatus: 'Verified' }],
    certifications: [{ title: 'Certified Embedded Systems Architect', issuer: 'IEEE Computer Society', date: '2026-05-10', credentialId: 'IEEE-EMB-8910', verified: true }],
    timeline: [{ type: 'Project', title: 'Edge Analytics Deployment', date: 'May 2026', details: 'Validated on hardware testbed.' }]
  },
  {
    studentId: 'STU-SKCET-001',
    regNo: '720722105041',
    name: 'Ananya Ramesh',
    email: 'ananya.r@skcet.ac.in',
    phone: '+91 98432 55667',
    collegeId: 'TN050',
    collegeName: 'Sri Krishna College of Engineering and Technology',
    department: 'EEE',
    year: '3rd Year',
    semester: 'Sem 6',
    cgpa: '8.72',
    backlogs: 0,
    headline: 'B.E EEE • Smart Grid Telemetry & Cloud Analytics',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    readinessScore: 84,
    aiMatchScore: 86,
    courseProgress: 80,
    certificatesCount: 5,
    careerGoal: 'Industrial IoT & Energy Systems Engineer',
    placementStatus: 'Internship Ready',
    preferredRoles: ['Data Analyst Intern', 'IoT Systems Engineer'],
    skills: [
      { name: 'Python', level: 'Advanced', confidence: 88, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'SQL', level: 'Intermediate', confidence: 85, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Power BI', level: 'Intermediate', confidence: 82, verified: true, hasAssessment: true, hasCourse: true, hasProject: true }
    ],
    readinessBreakdown: { technicalSkills: 85, projects: 84, certificates: 80, communication: 88, interviewReadiness: 78 },
    courseProgressList: [{ name: 'Industrial IoT Analytics', progress: 85, status: 'Active' }],
    projectsList: [{ id: 'PRJ-SKCET-01', title: 'Microgrid Battery Health Forecasting', technologies: ['Python', 'Pandas', 'Power BI'], description: 'Predicting degradation of lithium battery arrays.', github: 'https://github.com/ananya/microgrid-forecast', liveDemo: '', verified: true, verificationStatus: 'Verified' }],
    certifications: [{ title: 'Power BI Data Analyst Associate', issuer: 'Microsoft', date: '2026-03-20', credentialId: 'MS-PL300-4412', verified: true }],
    timeline: [{ type: 'Assessment', title: 'Data Telemetry Score: 88%', date: 'Apr 2026', details: 'Top 10th percentile in state.' }]
  },
  {
    studentId: 'STU-KEC-001',
    regNo: '21MER108',
    name: 'Vignesh V',
    email: 'vignesh.v@kongu.edu',
    phone: '+91 97500 88991',
    collegeId: 'TN060',
    collegeName: 'Kongu Engineering College',
    department: 'Mechanical',
    year: '4th Year',
    semester: 'Sem 8',
    cgpa: '8.45',
    backlogs: 0,
    headline: 'B.E Mechanical • Robotics Simulation & ROS2 • Python',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    readinessScore: 82,
    aiMatchScore: 83,
    courseProgress: 88,
    certificatesCount: 4,
    careerGoal: 'Robotics Software & Automation Engineer',
    placementStatus: 'Job Ready',
    preferredRoles: ['Robotics Engineer', 'Software Engineer'],
    skills: [
      { name: 'Python', level: 'Advanced', confidence: 85, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'C++', level: 'Intermediate', confidence: 80, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'Git', level: 'Intermediate', confidence: 84, verified: true, hasAssessment: true, hasCourse: true, hasProject: true }
    ],
    readinessBreakdown: { technicalSkills: 84, projects: 85, certificates: 75, communication: 80, interviewReadiness: 80 },
    courseProgressList: [{ name: 'Autonomous Navigation with ROS2', progress: 90, status: 'Completed' }],
    projectsList: [{ id: 'PRJ-KEC-01', title: 'Autonomous Warehouse Rover SLAM', technologies: ['Python', 'ROS2', 'C++'], description: 'LiDAR mapping and obstacle avoidance navigation.', github: 'https://github.com/vignesh/rover-slam', liveDemo: '', verified: true, verificationStatus: 'Verified' }],
    certifications: [{ title: 'Certified ROS Developer', issuer: 'The Construct', date: '2026-02-28', credentialId: 'ROS-DEV-1192', verified: true }],
    timeline: [{ type: 'Hackathon', title: 'Robotics Design Challenge 2nd Place', date: 'Mar 2026', details: 'Built working prototype.' }]
  },
  {
    studentId: 'STU-KSG-001',
    regNo: '711622103019',
    name: 'Naveen Kumar',
    email: 'naveen.k@ksg.edu.in',
    phone: '+91 96554 33221',
    collegeId: 'TN070',
    collegeName: 'KSG Institute of Technology',
    department: 'Civil',
    year: '3rd Year',
    semester: 'Sem 6',
    cgpa: '8.30',
    backlogs: 0,
    headline: 'B.E Civil • Computational Structural Analysis & BIM',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    readinessScore: 78,
    aiMatchScore: 80,
    courseProgress: 75,
    certificatesCount: 3,
    careerGoal: 'Computational BIM & Structural Modeler',
    placementStatus: 'Internship Ready',
    preferredRoles: ['BIM Engineer', 'Data Analyst Intern'],
    skills: [
      { name: 'Python', level: 'Intermediate', confidence: 78, verified: true, hasAssessment: true, hasCourse: true, hasProject: true },
      { name: 'SQL', level: 'Intermediate', confidence: 75, verified: true, hasAssessment: true, hasCourse: true, hasProject: false }
    ],
    readinessBreakdown: { technicalSkills: 78, projects: 76, certificates: 70, communication: 82, interviewReadiness: 74 },
    courseProgressList: [{ name: 'BIM Parametric Automation', progress: 75, status: 'Active' }],
    projectsList: [{ id: 'PRJ-KSG-01', title: 'Automated Revit Floor Plan Generator', technologies: ['Python', 'Dynamo', 'Revit API'], description: 'Parametric generation of multi-story architectural schemas.', github: '', liveDemo: '', verified: true, verificationStatus: 'Verified' }],
    certifications: [{ title: 'Autodesk Certified Professional: Revit', issuer: 'Autodesk', date: '2026-04-12', credentialId: 'ADSK-REV-9912', verified: true }],
    timeline: [{ type: 'Course', title: 'Parametric BIM Completed', date: 'Apr 2026', details: 'Passed examination with distinction.' }]
  }
];

moreStudents.forEach(cand => {
  const existingIdx = data.students.findIndex(s => s.studentId === cand.studentId || s.name === cand.name);
  if (existingIdx >= 0) {
    data.students[existingIdx] = { ...data.students[existingIdx], ...cand };
  } else {
    data.students.push(cand);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Total students now:', data.students.length);
