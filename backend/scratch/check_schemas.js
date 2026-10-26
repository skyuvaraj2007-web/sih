require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const usersCols = await rm.pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log('users columns:', usersCols.rows);

  const studentsCols = await rm.pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students' ORDER BY ordinal_position");
  console.log('students columns:', studentsCols.rows);

  const r = await rm.pg.query('SELECT id, company_name, registration_number FROM companies');
  console.log('Companies:', r.rows);
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
