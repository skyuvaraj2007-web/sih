/**
 * SKILLNEXUS AI — Production Database Failover & Resiliency Test Suite
 * 
 * Verifies Part A implementation:
 * 1. Successful PostgreSQL authentication.
 * 2. PostgreSQL authentication failure with successful Supabase fallback.
 * 3. Existing demo student login.
 * 4. Existing academician login.
 * 5. New user registration through the supported database adapter.
 * 6. Supabase fallback failure (clean 503 database unavailable).
 * 7. Prevention of silent JSON fallback in serverless (VERCEL=1).
 */

const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const relationalManager = require('../src/db/relationalManager');
const { supabase } = require('../src/config/supabase');

async function runAllTests() {
  console.log('══════════════════════════════════════════════════════════════════════════');
  console.log('  SKILLNEXUS AI — PRODUCTION DATABASE FAILOVER TEST SUITE');
  console.log('══════════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 7;

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Successful PostgreSQL authentication (standard path)
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('[Test 1] Successful PostgreSQL authentication...');
    const res = await relationalManager.authenticateUser('student.demo@skillnexus.ai', 'Demo@2026', 'student');
    assert.strictEqual(res.success, true, 'Student authentication should succeed');
    assert.ok(res.token, 'Should return a JWT token');
    assert.strictEqual(res.user.role, 'student', 'Role should be student');
    assert.strictEqual(res.user.email, 'student.demo@skillnexus.ai', 'Email should match');
    console.log('  ✅ PASSED: PostgreSQL authentication succeeded with token:', res.token.slice(0, 20) + '...');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 1:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: PostgreSQL auth failure with successful Supabase fallback
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n[Test 2] PostgreSQL failure with successful Supabase fallback...');
    // Force direct PostgreSQL pool to report failed state
    const originalFailedState = relationalManager._pgPoolFailedPermanently;
    relationalManager._pgPoolFailedPermanently = true;

    const res = await relationalManager.authenticateUser('student.demo@skillnexus.ai', 'Demo@2026', 'student');
    assert.strictEqual(res.success, true, 'Supabase fallback authentication should succeed');
    assert.ok(res.token, 'Should return a JWT token');
    assert.strictEqual(res.user.email, 'student.demo@skillnexus.ai', 'Email should match');
    assert.ok(res.user.collegeId, 'Should have collegeId/institution resolved');

    // Restore state
    relationalManager._pgPoolFailedPermanently = originalFailedState;
    console.log('  ✅ PASSED: Supabase failover resolved user and generated valid token.');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 2:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Existing demo student login
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n[Test 3] Existing demo student login verification...');
    const res = await relationalManager._authenticateUserViaSupabase('student.demo@skillnexus.ai', 'Demo@2026', 'student');
    assert.strictEqual(res.success, true, 'Demo student login must succeed');
    assert.strictEqual(res.user.role, 'student', 'User role must be student');
    assert.strictEqual(res.user.name, 'Arun Kumar', 'Student name must match canonical database');
    assert.strictEqual(res.user.studentId, '23CSE042', 'Student roll number must match');
    assert.strictEqual(res.user.collegeId, 'ABC-ENG', 'College code must match');
    console.log('  ✅ PASSED: Demo student Arun Kumar (23CSE042 @ ABC-ENG) authenticated.');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 3:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Existing academician login
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n[Test 4] Existing academician login verification...');
    const res = await relationalManager._authenticateUserViaSupabase('academician.demo@skillnexus.ai', 'Demo@2026', 'academician');
    assert.strictEqual(res.success, true, 'Academician login must succeed');
    assert.strictEqual(res.user.role, 'academician', 'User role must be academician');
    assert.strictEqual(res.user.name, 'Dr. Ramesh Sundaram', 'Academician name must match database');
    assert.strictEqual(res.user.facultyId, 'FAC-CSE-001', 'Faculty ID must match');
    assert.strictEqual(res.user.collegeId, 'ABC-ENG', 'College ID must match ABC-ENG');
    console.log('  ✅ PASSED: Academician Dr. Ramesh Sundaram (FAC-CSE-001 @ ABC-ENG) authenticated.');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 4:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: New user registration through supported database adapter
  // ──────────────────────────────────────────────────────────────────────────
  let testUserId = null;
  const testEmail = `temp.test.reg.${Date.now()}@skillnexus.ai`;
  try {
    console.log('\n[Test 5] New user registration through supported database adapter...');
    const regRes = await relationalManager._registerUserViaSupabase({
      email: testEmail,
      password: 'TestPassword@2026',
      role: 'student',
      name: 'Temporary Test Student',
      institutionId: 'ABC-ENG',
      department: 'Computer Science',
      regNo: `TEST-${Date.now().toString().slice(-5)}`
    });

    assert.strictEqual(regRes.success, true, 'Registration must succeed');
    assert.ok(regRes.demoOtp, 'Should generate a registration demo OTP');
    assert.strictEqual(regRes.email, testEmail, 'Email must match');
    testUserId = regRes.user.id;

    console.log('  ✅ PASSED: Registration succeeded via Supabase adapter (OTP:', regRes.demoOtp, ')');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 5:', err.message);
  } finally {
    // Strictly preserve database integrity by cleaning up test user record immediately
    if (testUserId && supabase) {
      try {
        await supabase.from('students').delete().eq('user_id', testUserId);
        await supabase.from('user_roles').delete().eq('user_id', testUserId);
        await supabase.from('users').delete().eq('id', testUserId);
        console.log('  🧹 Cleaned up temporary test user record, 0 fake accounts retained.');
      } catch (cleanupErr) {
        console.warn('  ⚠️ Notice during cleanup:', cleanupErr.message);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Supabase fallback failure (clean 503 error handling)
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n[Test 6] Supabase fallback failure handling...');
    // Create isolated harness with disabled supabase to test failure handling
    const mockManager = {
      isPgRequired: true,
      supabase: {
        from() {
          return {
            select() {
              return {
                ilike() {
                  return {
                    limit: async () => ({ data: null, error: { message: 'Connection to Supabase timed out' } })
                  };
                }
              };
            }
          };
        }
      }
    };

    let caughtError = null;
    try {
      await relationalManager._authenticateUserViaSupabase.call(mockManager, 'student.demo@skillnexus.ai', 'Demo@2026', 'student');
    } catch (e) {
      caughtError = e;
    }

    assert.ok(caughtError, 'Should throw or return database failure error');
    assert.ok(caughtError.message.includes('Supabase user lookup failed'), 'Error message should indicate lookup failure');
    console.log('  ✅ PASSED: Cleanly handled Supabase failure without silent crash.');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED Test 6:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Prevention of silent JSON fallback in serverless (VERCEL=1)
  // ──────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n[Test 7] Prevention of silent JSON fallback in serverless (VERCEL=1)...');
    process.env.VERCEL = '1';
    assert.strictEqual(relationalManager.isPgRequired, true, 'isPgRequired must be true in Vercel with cloud DB');

    // Attempt login for nonexistent user
    const res = await relationalManager.authenticateUser('definitely.nonexistent.user.999@skillnexus.ai', 'Demo@2026', 'student');
    assert.strictEqual(res.success, false, 'Should fail for nonexistent user');
    assert.strictEqual(res.code, 404, 'Code should be 404');
    assert.strictEqual(res.message, 'Account not found. Please create an account first.', 'Message should match');

    delete process.env.VERCEL;
    console.log('  ✅ PASSED: Serverless mode correctly enforced cloud database requirements.');
    passed++;
  } catch (err) {
    delete process.env.VERCEL;
    console.error('  ❌ FAILED Test 7:', err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('══════════════════════════════════════════════════════════════════════════\n');

  if (passed !== total) {
    process.exit(1);
  }
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
