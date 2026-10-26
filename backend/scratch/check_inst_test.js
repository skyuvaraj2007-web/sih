require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const users = await rm.pg.query("SELECT * FROM users WHERE email LIKE '%@insta.edu.in%' OR email LIKE '%@instb.edu.in%'");
  console.log('Institutions/students in users:', users.rows);

  const insts = await rm.pg.query("SELECT * FROM institutions WHERE code LIKE 'INST_%'");
  console.log('Institutions in institutions:', insts.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
