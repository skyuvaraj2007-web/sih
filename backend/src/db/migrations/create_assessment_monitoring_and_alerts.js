/**
 * SKILL NEXUS — Migration: Assessment Monitoring & Authority Alert System
 */
const { pool } = require('../../config/db');

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Starting Assessment Monitoring & Authority Alert Schema creation...');
    await client.query('BEGIN');

    // 1. assessment_monitoring_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_monitoring_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES assessment_monitoring_sessions(id) ON DELETE SET NULL,
        assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        assessment_type VARCHAR(50) DEFAULT 'ACADEMIC',
        event_type VARCHAR(100) NOT NULL,
        event_description TEXT,
        severity VARCHAR(30) DEFAULT 'INFO',
        occurred_at TIMESTAMPTZ DEFAULT NOW(),
        duration_seconds INT DEFAULT 0,
        confidence NUMERIC DEFAULT 100.0,
        question_id VARCHAR(100),
        metadata JSONB DEFAULT '{}'::jsonb,
        review_status VARCHAR(50) DEFAULT 'PENDING_REVIEW',
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] assessment_monitoring_events verified/created.');

    // Add indexes for efficient authority queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ame_assessment_id ON assessment_monitoring_events(assessment_id);
      CREATE INDEX IF NOT EXISTS idx_ame_student_id ON assessment_monitoring_events(student_id);
      CREATE INDEX IF NOT EXISTS idx_ame_type_status ON assessment_monitoring_events(assessment_type, review_status);
      CREATE INDEX IF NOT EXISTS idx_ame_severity ON assessment_monitoring_events(severity);
    `);

    // 2. assessment_notification_recipients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_notification_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES assessment_monitoring_events(id) ON DELETE CASCADE,
        recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipient_role VARCHAR(50) NOT NULL,
        notification_status VARCHAR(50) DEFAULT 'SENT',
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] assessment_notification_recipients verified/created.');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_anr_recipient ON assessment_notification_recipients(recipient_user_id, notification_status);
      CREATE INDEX IF NOT EXISTS idx_anr_event ON assessment_notification_recipients(event_id);
    `);

    // 3. assessment_event_reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_event_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES assessment_monitoring_events(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        review_action VARCHAR(50) NOT NULL,
        reviewer_comment TEXT,
        reviewed_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] assessment_event_reviews verified/created.');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_aer_event ON assessment_event_reviews(event_id);
      CREATE INDEX IF NOT EXISTS idx_aer_reviewer ON assessment_event_reviews(reviewer_id);
    `);

    // 4. assessment_monitoring_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_monitoring_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id UUID UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
        fullscreen_monitoring_enabled BOOLEAN DEFAULT TRUE,
        camera_monitoring_enabled BOOLEAN DEFAULT TRUE,
        face_presence_enabled BOOLEAN DEFAULT TRUE,
        notification_threshold VARCHAR(50) DEFAULT 'WARNING',
        configured_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Migration] assessment_monitoring_settings verified/created.');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ams_asmt ON assessment_monitoring_settings(assessment_id);
    `);

    await client.query('COMMIT');
    console.log('[Migration] Successfully applied all monitoring and alert tables.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Migration] Failed to run migration:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

if (require.main === module) {
  runMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { runMigration };

