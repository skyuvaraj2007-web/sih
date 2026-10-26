require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const arun = await rm.pg.query(`
    SELECT s.id, s.user_id, s.institution_id, s.roll_number, s.full_name, u.email 
    FROM students s 
    JOIN users u ON u.id = s.user_id 
    WHERE u.email LIKE '%arun%' OR s.full_name LIKE '%Arun%'
  `);
  console.log('Arun in PG:', arun.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
