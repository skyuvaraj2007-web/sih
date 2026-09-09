require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const users = await rm.pg.query("SELECT id, email, role FROM users WHERE email LIKE 'student.a.%' ORDER BY created_at DESC LIMIT 5");
  console.log('Students in users table:', users.rows);

  const students = await rm.pg.query("SELECT s.id, s.user_id, s.institution_id, s.roll_number, s.full_name, u.email FROM students s JOIN users u ON u.id = s.user_id WHERE u.email LIKE 'student.a.%' ORDER BY s.created_at DESC LIMIT 5");
  console.log('Students in students table:', students.rows);

  const attempts = await rm.pg.query("SELECT aa.* FROM assessment_attempts aa ORDER BY aa.completed_at DESC LIMIT 5");
  console.log('Recent assessment attempts:', attempts.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
