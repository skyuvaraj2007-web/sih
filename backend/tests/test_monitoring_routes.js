const assert = require('assert');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const assessmentsRouter = require('../src/routes/assessments');
const relationalManager = require('../src/db/relationalManager');

const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_quantum_super_secret_jwt_key_2026';

const app = express();
app.use(express.json());
app.use('/api/assessments', assessmentsRouter);

async function testRoutes() {
  console.log('Testing Assessment Monitoring Router Endpoints with signed JWT...');
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/assessments`;

  // Get a real academician user from database
  const { pool } = require('../src/config/db');
  const userRes = await pool.query(`
    SELECT u.id, u.email, LOWER(r.code) as role 
    FROM users u 
    JOIN user_roles ur ON ur.user_id = u.id 
    JOIN roles r ON r.id = ur.role_id 
    WHERE LOWER(r.code) IN ('academician', 'faculty', 'institution')
    LIMIT 1
  `);
  const acadUser = userRes.rows[0];
  const token = jwt.sign(
    { id: acadUser.id, email: acadUser.email, role: acadUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    const facultyRes = await fetch(`${baseUrl}/monitoring/faculty-alerts`, { headers });
    const facultyData = await facultyRes.json();
    console.log('facultyRes status:', facultyRes.status, facultyData);
    assert.strictEqual(facultyRes.status, 200, `Expected 200, got ${facultyRes.status}`);
    assert(facultyData.success, 'faculty-alerts returned success');
    console.log('✓ GET /api/assessments/monitoring/faculty-alerts -> 200 OK');

    const coordRes = await fetch(`${baseUrl}/monitoring/coordinator-alerts`, { headers });
    const coordData = await coordRes.json();
    assert.strictEqual(coordRes.status, 200);
    assert(coordData.success, 'coordinator-alerts returned success');
    console.log('✓ GET /api/assessments/monitoring/coordinator-alerts -> 200 OK');

    const instRes = await fetch(`${baseUrl}/monitoring/institution-overview`, { headers });
    const instData = await instRes.json();
    assert.strictEqual(instRes.status, 200);
    assert(instData.success, 'institution-overview returned success');
    console.log('✓ GET /api/assessments/monitoring/institution-overview -> 200 OK');

    // Test Company User
    const compUserRes = await pool.query(`
      SELECT u.id, u.email, LOWER(r.code) as role 
      FROM users u 
      JOIN user_roles ur ON ur.user_id = u.id 
      JOIN roles r ON r.id = ur.role_id 
      WHERE LOWER(r.code) = 'company'
      LIMIT 1
    `);
    const compUser = compUserRes.rows[0];
    if (compUser) {
      const compToken = jwt.sign(
        { id: compUser.id, email: compUser.email, role: compUser.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const compRes = await fetch(`${baseUrl}/monitoring/company-alerts`, {
        headers: { 'Authorization': `Bearer ${compToken}` }
      });
      const compData = await compRes.json();
      assert.strictEqual(compRes.status, 200);
      assert(compData.success, 'company-alerts returned success');
      console.log('✓ GET /api/assessments/monitoring/company-alerts -> 200 OK');
    }

    console.log('✓ All Router endpoints verified cleanly!');
  } finally {
    server.close();
  }
}

testRoutes().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
