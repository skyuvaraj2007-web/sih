const http = require('http');

function req(method, urlPath, body, token) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const clientReq = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    clientReq.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (payload) clientReq.write(payload);
    clientReq.end();
  });
}

async function debugAssessmentFlow() {
  const ts = Date.now();
  const instCode = `INST_TEST_${ts}`;

  // 1. Register Institution
  console.log('1. Registering institution...');
  const instRes = await req('POST', '/auth/register', {
    email: `admin.${ts}@testinst.edu.in`,
    password: 'Password123!',
    role: 'institution',
    institutionName: 'Debug Tech Institute',
    institutionCode: instCode,
    collegeId: instCode,
    district: 'Chennai'
  });
  const instToken = instRes.data?.token;
  console.log('Inst token:', Boolean(instToken), 'Inst status:', instRes.status);

  // 2. Register Student
  console.log('2. Registering student...');
  const stuRes = await req('POST', '/auth/register', {
    email: `student.${ts}@testinst.edu.in`,
    password: 'Password123!',
    role: 'student',
    fullName: 'Debug Student',
    collegeId: instCode,
    department: 'CSE',
    regNo: `REG_${ts}`,
    cgpa: '8.50',
    graduationYear: 2027
  });
  const stuToken = stuRes.data?.token;
  const stuId = stuRes.data?.user?.studentId || stuRes.data?.user?.id;
  console.log('Stu token:', Boolean(stuToken), 'Stu status:', stuRes.status, 'stuId:', stuId);

  // 3. Institution creates assessment
  console.log('3. Institution creates assessment...');
  const asmtRes = await req('POST', '/academic/assessments', {
    title: 'Diagnostic Test',
    assessmentType: 'PROGRAMMING',
    durationMinutes: 45,
    totalMarks: 100
  }, instToken);
  const assessmentId = asmtRes.data?.data?.id;
  console.log('Asmt created:', asmtRes.status, 'assessmentId:', assessmentId);

  // 4. Student submits attempt
  console.log('4. Student submits attempt...');
  const submitRes = await req('POST', `/assessments/institution/${assessmentId}/submit`, {
    answers: {}
  }, stuToken);
  console.log('Submit res:', submitRes.status, submitRes.data);

  // 5. Institution queries results
  console.log('5. Institution queries results...');
  const resultsRes = await req('GET', `/academic/assessments/${assessmentId}/results`, null, instToken);
  console.log('Results query status:', resultsRes.status);
  console.log('Results query data:', JSON.stringify(resultsRes.data, null, 2));

  process.exit(0);
}

debugAssessmentFlow().catch(e => { console.error(e); process.exit(1); });
