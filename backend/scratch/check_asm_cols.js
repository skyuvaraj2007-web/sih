require('dotenv').config();
const rm = require('../src/db/relationalManager');

async function test() {
  const asmCols = await rm.pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assessments' ORDER BY ordinal_position");
  console.log('assessments columns:', asmCols.rows);

  const attCols = await rm.pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assessment_attempts' ORDER BY ordinal_position");
  console.log('assessment_attempts columns:', attCols.rows);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
