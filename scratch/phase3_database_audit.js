const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

const REQUIRED_TABLES = [
  'users',
  'roles',
  'user_roles',
  'institutions',
  'departments',
  'institution_members',
  'students',
  'skills',
  'student_skills',
  'skill_evidence',
  'assessments',
  'assessment_questions',
  'question_options',
  'assessment_attempts',
  'assessment_answers',
  'courses',
  'course_modules',
  'enrollments',
  'student_module_progress',
  'projects',
  'project_skills',
  'project_proofs',
  'certificates',
  'digital_passports',
  'companies',
  'company_members',
  'company_institution_partnerships',
  'institution_company_access_requests',
  'institution_company_shared_students',
  'opportunities',
  'opportunity_skills',
  'applications',
  'application_stage_history',
  'interviews',
  'notifications',
  'match_results',
  'audit_logs'
];

async function auditDatabase() {
  console.log('================================================================');
  console.log('🔍 PHASE 3: COMPREHENSIVE POSTGRESQL TRUTH AUDIT');
  console.log('================================================================\n');

  if (!rm.pg) {
    console.error('❌ PostgreSQL connection not active in relationalManager!');
    process.exit(1);
  }

  // 1. Check table existence and row counts
  console.log('--- 1. TABLES AND ROW COUNTS ---');
  const tableCheck = await rm.pg.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  const existingTables = new Set(tableCheck.rows.map(r => r.table_name));

  const missingTables = [];
  const rowCounts = {};

  for (const t of REQUIRED_TABLES) {
    if (!existingTables.has(t)) {
      missingTables.push(t);
      console.log(`  ❌ MISSING TABLE: ${t}`);
    } else {
      try {
        const countRes = await rm.pg.query(`SELECT count(*)::int as count FROM "${t}"`);
        rowCounts[t] = countRes.rows[0].count;
        console.log(`  ✓ ${t.padEnd(36)} : ${rowCounts[t]} rows`);
      } catch (err) {
        console.log(`  ⚠️ Error querying count for ${t}: ${err.message}`);
      }
    }
  }

  console.log(`\nTotal public tables in DB: ${existingTables.size}`);
  console.log(`Required tables checked: ${REQUIRED_TABLES.length}`);
  console.log(`Missing required tables: ${missingTables.length}`);

  // 2. Check foreign keys
  console.log('\n--- 2. FOREIGN KEYS & CONSTRAINTS ---');
  const fkRes = await rm.pg.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `);
  console.log(`Total active Foreign Keys: ${fkRes.rows.length}`);

  // 3. Check for Orphan Records across core entities
  console.log('\n--- 3. ORPHAN RECORDS AUDIT ---');

  // students -> users
  const orphanStudents = await rm.pg.query(`
    SELECT count(*)::int as count FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL
  `);
  console.log(`  Orphan students (no user): ${orphanStudents.rows[0].count}`);

  // students -> institutions
  const orphanStudentInst = await rm.pg.query(`
    SELECT count(*)::int as count FROM students s LEFT JOIN institutions i ON s.institution_id = i.id WHERE s.institution_id IS NOT NULL AND i.id IS NULL
  `);
  console.log(`  Orphan student institutions: ${orphanStudentInst.rows[0].count}`);

  // student_skills -> students
  const orphanStudentSkills = await rm.pg.query(`
    SELECT count(*)::int as count FROM student_skills ss LEFT JOIN students s ON ss.student_id = s.id WHERE s.id IS NULL
  `);
  console.log(`  Orphan student_skills (no student): ${orphanStudentSkills.rows[0].count}`);

  // student_skills -> skills
  const orphanSkills = await rm.pg.query(`
    SELECT count(*)::int as count FROM student_skills ss LEFT JOIN skills sk ON ss.skill_id = sk.id WHERE sk.id IS NULL
  `);
  console.log(`  Orphan student_skills (no skill): ${orphanSkills.rows[0].count}`);

  // skill_evidence -> student_skills
  const orphanEvidence = await rm.pg.query(`
    SELECT count(*)::int as count FROM skill_evidence se LEFT JOIN student_skills ss ON se.student_skill_id = ss.id WHERE ss.id IS NULL
  `);
  console.log(`  Orphan skill_evidence: ${orphanEvidence.rows[0].count}`);

  // enrollments -> students
  const orphanEnrollments = await rm.pg.query(`
    SELECT count(*)::int as count FROM enrollments e LEFT JOIN students s ON e.student_id = s.id WHERE s.id IS NULL
  `);
  console.log(`  Orphan enrollments: ${orphanEnrollments.rows[0].count}`);

  // student_module_progress -> enrollments
  const orphanModuleProg = await rm.pg.query(`
    SELECT count(*)::int as count FROM student_module_progress smp LEFT JOIN enrollments e ON smp.enrollment_id = e.id WHERE e.id IS NULL
  `);
  console.log(`  Orphan module progress: ${orphanModuleProg.rows[0].count}`);

  // applications -> students
  const orphanApps = await rm.pg.query(`
    SELECT count(*)::int as count FROM applications a LEFT JOIN students s ON a.student_id = s.id WHERE s.id IS NULL
  `);
  console.log(`  Orphan applications (no student): ${orphanApps.rows[0].count}`);

  // applications -> opportunities
  const orphanAppOpps = await rm.pg.query(`
    SELECT count(*)::int as count FROM applications a LEFT JOIN opportunities o ON a.opportunity_id = o.id WHERE o.id IS NULL
  `);
  console.log(`  Orphan applications (no opportunity): ${orphanAppOpps.rows[0].count}`);

  // application_stage_history -> applications
  const orphanStageHistory = await rm.pg.query(`
    SELECT count(*)::int as count FROM application_stage_history ash LEFT JOIN applications a ON ash.application_id = a.id WHERE a.id IS NULL
  `);
  console.log(`  Orphan stage history: ${orphanStageHistory.rows[0].count}`);

  // assessment_attempts -> students
  const orphanAttempts = await rm.pg.query(`
    SELECT count(*)::int as count FROM assessment_attempts aa LEFT JOIN students s ON aa.student_id = s.id WHERE s.id IS NULL
  `);
  console.log(`  Orphan assessment attempts: ${orphanAttempts.rows[0].count}`);

  // assessment_answers -> attempts
  const orphanAnswers = await rm.pg.query(`
    SELECT count(*)::int as count FROM assessment_answers ans LEFT JOIN assessment_attempts aa ON ans.attempt_id = aa.id WHERE aa.id IS NULL
  `);
  console.log(`  Orphan assessment answers: ${orphanAnswers.rows[0].count}`);

  // 4. Check assessment_questions and assessments schema
  console.log('\n--- 4. ASSESSMENT & QUESTIONS COLUMNS ---');
  const asmQCols = await rm.pg.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'assessment_questions' ORDER BY ordinal_position"
  );
  console.log('assessment_questions columns:', asmQCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

  const qOptCols = await rm.pg.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'question_options' ORDER BY ordinal_position"
  );
  console.log('question_options columns:', qOptCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));

  process.exit(0);
}

auditDatabase().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
