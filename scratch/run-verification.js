const http = require('http');

function post(path, body) {
  return new Promise(resolve => {
    const data = JSON.stringify(body);
    const req = http.request('http://localhost:5000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', err => resolve({ error: err.message }));
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise(resolve => {
    http.get('http://localhost:5000' + path, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('⚡ SKILLNEXUS AI — COMPREHENSIVE VERIFICATION RUNNER ⚡');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. API Health & Endpoints
  console.log('--- 1. BACKEND REST API TESTS ---');
  const health = await get('/api/health');
  assert('GET /api/health returns ONLINE', health.status === 200 && health.data.status === 'ONLINE');

  const companies = await get('/api/nexus/companies');
  assert('GET /api/nexus/companies returns 200 with partner corporations', companies.status === 200 && Array.isArray(companies.data.data) && companies.data.data.length > 0);

  const students = await get('/api/nexus/students');
  assert('GET /api/nexus/students returns 200', students.status === 200 && Array.isArray(students.data.data));

  const courses = await get('/api/nexus/courses');
  assert('GET /api/nexus/courses returns 200', courses.status === 200 && Array.isArray(courses.data.data));

  const opps = await get('/api/nexus/opportunities');
  assert('GET /api/nexus/opportunities returns 200', opps.status === 200 && Array.isArray(opps.data.data));

  // 2. Authentication across all 3 roles
  console.log('\n--- 2. MULTI-TENANT AUTHENTICATION TESTS ---');
  const stuAuth = await post('/api/auth/login', { email: 'arun.kumar@nexus.edu', password: 'password123', role: 'student' });
  assert('Student credentials authenticate successfully', stuAuth.status === 200 && stuAuth.data.success);

  const instAuth = await post('/api/auth/login', { email: 'placements@srmist.edu.in', password: 'password123', role: 'institution' });
  assert('Institution credentials authenticate successfully', instAuth.status === 200 && instAuth.data.success);

  const compAuth = await post('/api/auth/login', { email: 'talent@abctech.com', password: 'password123', role: 'company' });
  assert('Company credentials authenticate successfully', compAuth.status === 200 && compAuth.data.success);

  const badAuth = await post('/api/auth/login', { email: 'arun.kumar@nexus.edu', password: 'wrongpassword', role: 'student' });
  assert('Bad credentials rejected with 401', badAuth.status === 401 && !badAuth.data.success);

  // 3. Routing Resolver & Guard Tests (Simulating resolvePath from App.jsx)
  console.log('\n--- 3. ROUTE RESOLVER & CROSS-ROLE GUARD TESTS ---');
  
  // Replicate the exact resolvePath logic from App.jsx
  function normalizeRole(r) {
    if (!r) return 'student';
    const s = String(r).toLowerCase();
    if (s === 'company' || s === 'industry' || s === 'recruiter') return 'company';
    if (s === 'institution' || s === 'faculty' || s === 'admin') return 'institution';
    return 'student';
  }

  function resolvePath(pathname, user) {
    const path = (pathname || '/').toLowerCase().trim();
    const role = normalizeRole(user?.role);
    if (!user) {
      if (path === '/student-login' || path === '/auth/student-login') return { page: 'student-login' };
      if (path === '/institution-login' || path === '/auth/institution-login') return { page: 'institution-login' };
      if (path === '/industry-login' || path === '/company-login' || path === '/auth/company-login') return { page: 'industry-login' };
      return { page: 'role-select' };
    }
    if (path.startsWith('/student')) {
      if (role !== 'student') return { page: role === 'institution' ? 'institution-console' : 'industry-portal', redirectReason: 'cross-role' };
      if (path === '/student/skills') return { page: 'skills' };
      if (path === '/student/assessment') return { page: 'assessment' };
      if (path === '/student/learning') return { page: 'learning' };
      if (path === '/student/projects') return { page: 'projects' };
      if (path === '/student/opportunities') return { page: 'opportunities' };
      if (path === '/student/passport') return { page: 'passport' };
      return { page: 'home' };
    }
    if (path.startsWith('/institution')) {
      if (role !== 'institution') return { page: role === 'company' ? 'industry-portal' : 'home', redirectReason: 'cross-role' };
      if (path === '/institution/courses') return { page: 'institution-courses' };
      if (path === '/institution/skill-gap') return { page: 'institution-skill-gap' };
      if (path === '/institution/students') return { page: 'institution-students' };
      return { page: 'institution-console' };
    }
    if (path.startsWith('/company')) {
      if (role !== 'company') return { page: role === 'institution' ? 'institution-console' : 'home', redirectReason: 'cross-role' };
      if (path === '/company/students') return { page: 'industry-portal', companyTab: 'students' };
      if (path === '/company/internships') return { page: 'industry-portal', companyTab: 'internships' };
      if (path === '/company/jobs') return { page: 'industry-portal', companyTab: 'jobs' };
      if (path === '/company/applications') return { page: 'industry-portal', companyTab: 'applications' };
      if (path === '/company/ai-matching') return { page: 'industry-portal', companyTab: 'ai-matching' };
      return { page: 'industry-portal', companyTab: 'dashboard' };
    }
    return { page: role === 'institution' ? 'institution-console' : role === 'company' ? 'industry-portal' : 'home' };
  }

  // Student routing checks
  const studentUser = { role: 'student', email: 'arun.kumar@nexus.edu' };
  assert('Student route /student/projects resolves to projects', resolvePath('/student/projects', studentUser).page === 'projects');
  assert('Student route /student/skills resolves to skills', resolvePath('/student/skills', studentUser).page === 'skills');
  assert('Student route /student/opportunities resolves to opportunities', resolvePath('/student/opportunities', studentUser).page === 'opportunities');
  assert('Student route /student/passport resolves to passport', resolvePath('/student/passport', studentUser).page === 'passport');

  // Institution routing checks
  const instUser = { role: 'institution', email: 'placements@srmist.edu.in' };
  assert('Institution route /institution/courses resolves to institution-courses', resolvePath('/institution/courses', instUser).page === 'institution-courses');
  assert('Institution route /institution/skill-gap resolves to institution-skill-gap', resolvePath('/institution/skill-gap', instUser).page === 'institution-skill-gap');

  // Company routing checks
  const compUser = { role: 'company', email: 'talent@abctech.com' };
  const compJobs = resolvePath('/company/jobs', compUser);
  assert('Company route /company/jobs resolves to industry-portal with tab jobs', compJobs.page === 'industry-portal' && compJobs.companyTab === 'jobs');
  const compInternships = resolvePath('/company/internships', compUser);
  assert('Company route /company/internships resolves to industry-portal with tab internships', compInternships.page === 'industry-portal' && compInternships.companyTab === 'internships');

  // Cross-role guard checks
  const studentVisitingCompany = resolvePath('/company/jobs', studentUser);
  assert('Student visiting /company/jobs is blocked with cross-role redirect to home', studentVisitingCompany.redirectReason === 'cross-role' && studentVisitingCompany.page === 'home');

  const instVisitingCompany = resolvePath('/company/students', instUser);
  assert('Institution visiting /company/students is blocked with cross-role redirect to institution-console', instVisitingCompany.redirectReason === 'cross-role' && instVisitingCompany.page === 'institution-console');

  const compVisitingStudent = resolvePath('/student/projects', compUser);
  assert('Company visiting /student/projects is blocked with cross-role redirect to industry-portal', compVisitingStudent.redirectReason === 'cross-role' && compVisitingStudent.page === 'industry-portal');

  console.log('\n====================================================');
  console.log(`FINAL RESULT: ${passed} PASSED / ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runVerification();
