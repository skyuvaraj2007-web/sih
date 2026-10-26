require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const srmDepts = await rm.pg.query("SELECT * FROM departments WHERE institution_id = '60e7a0c1-e9e2-4eb5-acaa-437a9d81e436'");
  console.log('SRMIST departments:', srmDepts.rows);

  const arun = await rm.pg.query("SELECT s.institution_id, s.department_id FROM students s JOIN users u ON s.user_id = u.id WHERE u.email = 'arun.kumar@nexus.edu'");
  console.log('Arun dept & inst:', arun.rows);
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
