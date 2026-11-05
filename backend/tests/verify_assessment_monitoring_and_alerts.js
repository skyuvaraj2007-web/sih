/**
 * SKILLNEXUS — Verification Test Suite:
 * Intelligent Assessment Monitoring, Activity Detection, and Authority Notifications
 */
const assert = require('assert');
const { pool } = require('../src/config/db');
const assessmentGuardService = require('../src/services/assessmentGuardService');

async function runTests() {
  const client = await pool.connect();
  console.log('🧪 Starting Assessment Monitoring & Authority Alert Verification Suite...\n');

  try {
    // ── Setup / Identify Test Data ──
    // 1. Get an existing student
    const studentRes = await client.query(`
      SELECT s.id, s.user_id, s.institution_id, s.full_name, s.roll_number 
      FROM students s 
      WHERE s.institution_id IS NOT NULL 
      LIMIT 1;
    `);
    const testStudent = studentRes.rows[0];
    assert(testStudent, 'Test student must exist in database');
    console.log(`✓ Test student found: ${testStudent.full_name} (${testStudent.roll_number})`);

    // 2. Get or create an Academic assessment
    let academicAsmtRes = await client.query(`
      SELECT id, title, assessment_type, institution_id 
      FROM assessments 
      WHERE institution_id IS NOT NULL 
      LIMIT 1;
    `);
    let academicAsmt = academicAsmtRes.rows[0];
    if (!academicAsmt) {
      const insRes = await client.query(`
        INSERT INTO assessments (title, assessment_type, institution_id, duration_minutes, passing_score, track_code, domain)
        VALUES ('Automated Academic Exam', 'ACADEMIC', $1, 60, 50, 'ACADEMIC', 'Technology')
        RETURNING *;
      `, [testStudent.institution_id]);
      academicAsmt = insRes.rows[0];
    }
    console.log(`✓ Academic Assessment: "${academicAsmt.title}" (ID: ${academicAsmt.id})`);

    // 3. Get or create an Industry assessment
    let compRes = await client.query(`SELECT id FROM companies LIMIT 1;`);
    let companyId = compRes.rows[0]?.id;
    if (!companyId) {
      const compIns = await client.query(`
        INSERT INTO companies (name, email) VALUES ('Test Enterprise Ltd', 'recruiter@testcorp.com') RETURNING id;
      `);
      companyId = compIns.rows[0].id;
    }

    let industryAsmtRes = await client.query(`
      SELECT id, title, assessment_type, company_id 
      FROM assessments 
      WHERE company_id IS NOT NULL 
      LIMIT 1;
    `);
    let industryAsmt = industryAsmtRes.rows[0];
    if (!industryAsmt) {
      const indIns = await client.query(`
        INSERT INTO assessments (title, assessment_type, company_id, duration_minutes, passing_score, track_code, domain)
        VALUES ('Enterprise Coding Challenge', 'INDUSTRY', $1, 45, 60, 'INDUSTRY', 'Technology')
        RETURNING *;
      `, [companyId]);
      industryAsmt = indIns.rows[0];
    }
    console.log(`✓ Industry Assessment: "${industryAsmt.title}" (Company: ${companyId})`);

    // ── TEST 1: Consent & Session Lifecycle ──
    console.log('\n--- TEST 1: Session Lifecycle & Consent Enforcement ---');
    try {
      await assessmentGuardService.startSession({
        assessmentId: academicAsmt.id,
        studentId: testStudent.id,
        consentGiven: false
      });
      assert.fail('Starting session without consent must throw');
    } catch (err) {
      assert(err.message.includes('consent'), 'Error must mention student consent');
      console.log('✓ Rejected unconsented session attempt correctly.');
    }

    const sessionResult = await assessmentGuardService.startSession({
      assessmentId: academicAsmt.id,
      studentId: testStudent.id,
      consentGiven: true,
      cameraEnabled: true,
      microphoneEnabled: false
    });
    assert(sessionResult.success, 'Session initialization must succeed');
    assert(sessionResult.session?.id, 'Session must return an ID');
    const sessionId = sessionResult.session.id;
    console.log(`✓ Monitoring session created with consent: ${sessionId}`);

    // ── TEST 2: Academic Event Authority Routing ──
    console.log('\n--- TEST 2: Academic Assessment Event Routing ---');
    const eventRes = await assessmentGuardService.recordEvent({
      sessionId,
      assessmentId: academicAsmt.id,
      studentId: testStudent.id,
      eventType: 'TAB_SWITCH',
      durationSeconds: 4,
      confidence: 98.5,
      severity: 'WARNING',
      metadata: { browser: 'Chrome', tabTitle: 'Search' }
    });

    assert(eventRes.success, 'Event recording must succeed');
    assert(eventRes.event?.id, 'Event must have UUID');
    assert.strictEqual(eventRes.event.assessment_type, 'ACADEMIC');
    assert.strictEqual(eventRes.event.severity, 'WARNING');
    assert(eventRes.event.event_description.includes('Browser tab switched'), 'Friendly description generated');
    console.log(`✓ Academic event registered: ${eventRes.event.id} (Severity: ${eventRes.event.severity})`);

    // Verify recipient records
    const recipientRecords = await client.query(`
      SELECT anr.*, u.email 
      FROM assessment_notification_recipients anr
      LEFT JOIN users u ON u.id = anr.recipient_user_id
      WHERE anr.event_id = $1
    `, [eventRes.event.id]);

    console.log(`✓ Notification recipients dispatched: ${recipientRecords.rows.length}`);
    recipientRecords.rows.forEach(r => {
      console.log(`   - Recipient Role: ${r.recipient_role} (User: ${r.recipient_user_id})`);
      assert(['faculty', 'coordinator', 'institution_admin'].includes(r.recipient_role),
        'Academic recipients must only be faculty, coordinator, or institution_admin');
    });

    // ── TEST 3: Human Review & Escalation ──
    console.log('\n--- TEST 3: Event Review & Escalation Workflow ---');
    const reviewerUserId = recipientRecords.rows[0]?.recipient_user_id || testStudent.user_id;

    // Faculty reviews the event
    const reviewRes = await assessmentGuardService.reviewEvent({
      eventId: eventRes.event.id,
      reviewerUserId,
      reviewerRole: 'faculty',
      reviewStatus: 'NEEDS_MORE_REVIEW',
      notes: 'Student switched tabs briefly. Verifying with course log.'
    });
    assert(reviewRes.success, 'Review must succeed');
    assert.strictEqual(reviewRes.event.review_status, 'NEEDS_MORE_REVIEW');
    console.log('✓ Event reviewed by faculty: status set to NEEDS_MORE_REVIEW.');

    // Faculty escalates to coordinator
    const escalateRes = await assessmentGuardService.escalateEvent({
      eventId: eventRes.event.id,
      reviewerUserId,
      reviewerRole: 'faculty',
      notes: 'Second tab switch detected. Escalating to department coordinator for confirmation.',
      targetRole: 'coordinator'
    });
    assert(escalateRes.success, 'Escalation must succeed');
    assert.strictEqual(escalateRes.escalatedTo, 'coordinator');

    const updatedEventRes = await client.query(`
      SELECT review_status FROM assessment_monitoring_events WHERE id = $1
    `, [eventRes.event.id]);
    assert.strictEqual(updatedEventRes.rows[0].review_status, 'ESCALATED');
    console.log('✓ Event successfully escalated to Academic Coordinator.');

    // ── TEST 4: Industry Assessment Event & Strict Isolation ──
    console.log('\n--- TEST 4: Industry Event Routing & Strict Multi-Tenant Isolation ---');
    const indSessionRes = await assessmentGuardService.startSession({
      assessmentId: industryAsmt.id,
      studentId: testStudent.id,
      consentGiven: true,
      cameraEnabled: true
    });

    const indEventRes = await assessmentGuardService.recordEvent({
      sessionId: indSessionRes.session.id,
      assessmentId: industryAsmt.id,
      studentId: testStudent.id,
      eventType: 'PASTE_ATTEMPT',
      durationSeconds: 1,
      confidence: 100,
      severity: 'REVIEW_REQUIRED',
      metadata: { length: 240 }
    });

    assert(indEventRes.success, 'Industry event recording must succeed');
    assert.strictEqual(indEventRes.event.assessment_type, 'INDUSTRY');
    assert.strictEqual(indEventRes.event.severity, 'REVIEW_REQUIRED');

    const indRecipients = await client.query(`
      SELECT anr.* FROM assessment_notification_recipients anr WHERE anr.event_id = $1
    `, [indEventRes.event.id]);

    console.log(`✓ Industry notification recipients dispatched: ${indRecipients.rows.length}`);
    indRecipients.rows.forEach(r => {
      console.log(`   - Industry Recipient Role: ${r.recipient_role} (User: ${r.recipient_user_id})`);
      assert(['company_admin', 'industry_evaluator'].includes(r.recipient_role),
        'Industry recipients must ONLY be company_admin or industry_evaluator');
      assert(!['faculty', 'coordinator', 'institution_admin'].includes(r.recipient_role),
        'STRICT ISOLATION VIOLATION: Academic roles must NEVER receive industry events');
    });

    // Verify that Company Query NEVER returns Academic events
    const companyAlertsRes = await assessmentGuardService.getCompanyAlerts({
      userId: reviewerUserId,
      companyId: industryAsmt.company_id
    });
    assert(companyAlertsRes.success, 'Company alerts fetch must succeed');
    companyAlertsRes.data.forEach(e => {
      assert.strictEqual(e.assessment_type, 'INDUSTRY', 'STRICT ISOLATION: Company must NEVER see Academic events');
    });
    console.log(`✓ Strict Isolation Confirmed: Company query returned ${companyAlertsRes.data.length} strictly INDUSTRY events.`);

    // Verify that Institution Overview NEVER returns Industry events
    const instOverviewRes = await assessmentGuardService.getInstitutionOverview({
      userId: reviewerUserId,
      institutionId: testStudent.institution_id
    });
    assert(instOverviewRes.success, 'Institution overview fetch must succeed');
    instOverviewRes.events.forEach(e => {
      assert.strictEqual(e.assessment_type, 'ACADEMIC', 'STRICT ISOLATION: Institution must NEVER see Industry events');
    });
    console.log(`✓ Strict Isolation Confirmed: Institution query returned ${instOverviewRes.events.length} strictly ACADEMIC events.`);

    // ── TEST 5: Monitoring Settings Configuration ──
    console.log('\n--- TEST 5: Assessment Monitoring Settings Configuration ---');
    const settingsRes = await assessmentGuardService.updateMonitoringSettings({
      assessmentId: academicAsmt.id,
      settings: {
        fullscreenMonitoringEnabled: true,
        cameraMonitoringEnabled: true,
        facePresenceEnabled: true,
        notificationThreshold: 'REVIEW_REQUIRED'
      },
      userId: reviewerUserId
    });
    assert(settingsRes.success, 'Settings update must succeed');
    assert.strictEqual(settingsRes.settings.notification_threshold, 'REVIEW_REQUIRED');

    const fetchedSettings = await assessmentGuardService.getMonitoringSettings(academicAsmt.id);
    assert.strictEqual(fetchedSettings.notification_threshold, 'REVIEW_REQUIRED');
    console.log('✓ Monitoring settings successfully persisted and retrieved.');

    // ── TEST 6: Session Conclusion ──
    console.log('\n--- TEST 6: Conclude Sessions Cleanly ---');
    const endAcad = await assessmentGuardService.endSession({ sessionId });
    assert(endAcad.success, 'Ending session must succeed');
    assert.strictEqual(endAcad.session.status, 'COMPLETED');

    const endInd = await assessmentGuardService.endSession({ sessionId: indSessionRes.session.id });
    assert(endInd.success, 'Ending industry session must succeed');
    assert.strictEqual(endInd.session.status, 'COMPLETED');
    console.log('✓ Monitoring sessions successfully concluded.');

    console.log('\n🎉 ALL 6 VERIFICATION TEST SUITES PASSED FLAWLESSLY!\n');
  } catch (err) {
    console.error('❌ Verification test failed:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

runTests().then(() => process.exit(0)).catch(() => process.exit(1));

