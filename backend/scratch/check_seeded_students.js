require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const students = await rm.pg.query(`
    SELECT s.id, s.user_id, s.institution_id, s.roll_number, s.full_name, u.email 
    FROM students s 
    JOIN users u ON u.id = s.user_id 
    LIMIT 5
  `);
  console.log('Seeded students in PG:', students.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
