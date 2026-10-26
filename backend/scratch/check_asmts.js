require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const asmts = await rm.pg.query('SELECT * FROM assessments');
  console.log('Assessments in PG:', asmts.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
