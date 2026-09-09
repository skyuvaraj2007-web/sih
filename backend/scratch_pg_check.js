require('dotenv').config({ path: '.env' });
const rm = require('./src/db/relationalManager');
async function run() {
  // What does getStudentById('STU-TN010-001') actually hit?
  // The PG query uses: WHERE s.id::text = $1 OR s.roll_number = $1 OR u.id::text = $1 OR LOWER(u.email) = LOWER($1)
  const r1 = await rm.pg.query("SELECT id, roll_number, user_id FROM students WHERE roll_number = $1 LIMIT 1", ['STU-TN010-001']);
  console.log("PG: students WHERE roll_number = STU-TN010-001:", r1.rows[0] || 'NOT FOUND');
  
  const r2 = await rm.pg.query("SELECT id, email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", ['arun.kumar@nexus.edu']);
  console.log("PG: users WHERE email = arun.kumar@nexus.edu:", r2.rows[0] || 'NOT FOUND');
  
  if (r2.rows[0]) {
    const r3 = await rm.pg.query("SELECT id, roll_number, readiness_score FROM students WHERE user_id = $1 LIMIT 1", [r2.rows[0].id]);
    console.log("PG: students WHERE user_id = arun.user_id:", r3.rows[0] || 'NOT FOUND');
  }
  
  // How many PG students have roll_number matching STU- pattern?
  const r4 = await rm.pg.query("SELECT COUNT(*) FROM students WHERE roll_number LIKE 'STU-%'");
  console.log("PG: students with STU- roll_number:", r4.rows[0].count);
  
  // What are the readiness_score values in PG?
  const r5 = await rm.pg.query("SELECT readiness_score, COUNT(*) FROM students GROUP BY readiness_score ORDER BY readiness_score");
  console.log("PG readiness distribution:", r5.rows);
  
  // Certificates - which students have them?
  const r6 = await rm.pg.query("SELECT s.roll_number, s.full_name, c.title FROM certificates c JOIN students s ON s.id = c.student_id LIMIT 5");
  console.log("PG certificates:", r6.rows);
  
  // Applications - which students applied?
  const r7 = await rm.pg.query("SELECT s.roll_number, s.full_name, COUNT(a.id) as apps FROM applications a JOIN students s ON s.id = a.student_id GROUP BY s.id ORDER BY apps DESC LIMIT 5");
  console.log("PG applications per student:", r7.rows);
}
run().catch(console.error).finally(() => process.exit(0));
