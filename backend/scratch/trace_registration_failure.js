require('dotenv').config();
const rm = require('../src/db/relationalManager');
const bcrypt = require('bcryptjs');

async function trace() {
  const ts = Date.now();
  const email = `test.student.${ts}@test.edu.in`;
  const hash = bcrypt.hashSync('Password123!', 10);
  const newUserId = `usr_${ts}`;
  const studentId = `STU-TEST-${ts}`;
  const regNo = `REG_${ts}`;

  console.log('--- Step 1: Trying to insert into users with string newUserId ---');
  try {
    await rm.pg.query(
      `INSERT INTO users (id, email, password_hash, role, full_name, account_status, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      [newUserId, email, hash, 'STUDENT', 'Test Student', 'ACTIVE', true, new Date().toISOString()]
    );
    console.log('✅ Inserted user successfully');
  } catch (err) {
    console.log('❌ Failed inserting user:', err.message);
  }

  console.log('\n--- Step 2: Trying to insert into students with string IDs ---');
  try {
    await rm.pg.query(
      `INSERT INTO students (id, user_id, full_name, roll_number, phone_number, institution_id, graduation_year, cgpa, readiness_score, placement_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT DO NOTHING`,
      [
        studentId,
        newUserId,
        'Test Student',
        regNo,
        '',
        'TN010',
        2027,
        8.5,
        0,
        'Seeking Placement',
        new Date().toISOString()
      ]
    );
    console.log('✅ Inserted student successfully');
  } catch (err) {
    console.log('❌ Failed inserting student:', err.message);
  }

  process.exit(0);
}

trace().catch(e => { console.error(e); process.exit(1); });
