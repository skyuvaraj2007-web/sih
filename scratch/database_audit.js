import pg from '../backend/node_modules/pg/lib/index.js';

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'skillnexus_db'
});

async function runAudit() {
  const client = await pool.connect();
  console.log('================================================================');
  console.log('🔍 SKILL NEXUS AI — COMPREHENSIVE POSTGRESQL DATABASE AUDIT');
  console.log('================================================================\n');

  try {
    // 1. Duplicate email audit
    const dupEmails = await client.query(`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1;
    `);
    console.log(`[1] Duplicate Email Audit in 'users': ${dupEmails.rows.length} duplicate emails found.`);
    if (dupEmails.rows.length > 0) console.log(dupEmails.rows);

    // 2. Duplicate roll number audit
    const dupRoll = await client.query(`
      SELECT institution_id, roll_number, COUNT(*) as count 
      FROM students 
      WHERE roll_number IS NOT NULL
      GROUP BY institution_id, roll_number 
      HAVING COUNT(*) > 1;
    `);
    console.log(`[2] Duplicate Roll Number Audit: ${dupRoll.rows.length} duplicates found.`);
    if (dupRoll.rows.length > 0) console.log(dupRoll.rows);

    // 3. Duplicate application audit (student + opportunity)
    const dupApps = await client.query(`
      SELECT student_id, opportunity_id, COUNT(*) as count 
      FROM applications 
      GROUP BY student_id, opportunity_id 
      HAVING COUNT(*) > 1;
    `);
    console.log(`[3] Duplicate Application Audit (same student & opportunity): ${dupApps.rows.length} duplicates found.`);
    if (dupApps.rows.length > 0) console.log(dupApps.rows);

    // 4. Duplicate enrollment audit (student + course)
    const dupEnroll = await client.query(`
      SELECT student_id, course_id, COUNT(*) as count 
      FROM enrollments 
      GROUP BY student_id, course_id 
      HAVING COUNT(*) > 1;
    `);
    console.log(`[4] Duplicate Course Enrollment Audit: ${dupEnroll.rows.length} duplicates found.`);
    if (dupEnroll.rows.length > 0) console.log(dupEnroll.rows);

    // 5. Duplicate module progress audit (enrollment + module)
    const dupModuleProg = await client.query(`
      SELECT enrollment_id, module_id, COUNT(*) as count 
      FROM student_module_progress 
      GROUP BY enrollment_id, module_id 
      HAVING COUNT(*) > 1;
    `);
    console.log(`[5] Duplicate Student Module Progress Audit: ${dupModuleProg.rows.length} duplicates found.`);
    if (dupModuleProg.rows.length > 0) console.log(dupModuleProg.rows);

    // 6. Orphan student audit (students with no valid user)
    const orphanStudents = await client.query(`
      SELECT s.id, s.user_id 
      FROM students s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE u.id IS NULL;
    `);
    console.log(`[6] Orphan Students Audit (missing user): ${orphanStudents.rows.length} orphans found.`);

    // 7. Invalid student institution audit (students pointing to non-existent institution)
    const invalidInstStudents = await client.query(`
      SELECT s.id, s.institution_id 
      FROM students s 
      LEFT JOIN institutions i ON s.institution_id = i.id 
      WHERE s.institution_id IS NOT NULL AND i.id IS NULL;
    `);
    console.log(`[7] Invalid Student Institution Audit: ${invalidInstStudents.rows.length} invalid institution links.`);

    // 8. Invalid company access audit (shared students referencing invalid institution, company, or student)
    const invalidShared = await client.query(`
      SELECT ss.id 
      FROM institution_company_shared_students ss
      LEFT JOIN institutions i ON (ss.institution_id::text = i.id::text OR ss.institution_id::text = i.code::text)
      LEFT JOIN companies c ON (ss.company_id::text = c.id::text OR ss.company_id::text = c.registration_number::text)
      LEFT JOIN students s ON (ss.student_id::text = s.id::text OR ss.student_id::text = s.roll_number::text)
      WHERE i.id IS NULL OR c.id IS NULL OR s.id IS NULL;
    `);
    console.log(`[8] Invalid Company Access Audit (orphaned shared records): ${invalidShared.rows.length} invalid records.`);

    // 9. Invalid readiness audit (scores outside 0-100 or null)
    const invalidReadiness = await client.query(`
      SELECT id, user_id, readiness_score 
      FROM students 
      WHERE readiness_score < 0 OR readiness_score > 100 OR readiness_score IS NULL;
    `);
    console.log(`[9] Invalid Student Readiness Audit (out of bounds or null): ${invalidReadiness.rows.length} invalid records.`);

    // 10. Invalid notifications audit (notifications referencing missing users)
    const invalidNotifications = await client.query(`
      SELECT n.id, n.recipient_id 
      FROM notifications n 
      LEFT JOIN users u ON n.recipient_id = u.id 
      WHERE u.id IS NULL;
    `);
    console.log(`[10] Invalid Notifications Audit (missing recipient user): ${invalidNotifications.rows.length} orphaned notifications.`);

    // 11. Foreign key integrity check summary
    console.log('\n[11] Foreign Key Integrity Summary:');
    const fkSummary = await client.query(`
      SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
    `);
    console.log(`   Total Active Foreign Key Constraints in PostgreSQL: ${fkSummary.rows.length}`);

    console.log('\n================================================================');
    console.log('✅ DATABASE INTEGRITY AUDIT COMPLETE');
    console.log('================================================================');
  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runAudit();
