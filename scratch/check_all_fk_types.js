const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

async function main() {
  const tables = [
    'opportunities',
    'assessments',
    'assessment_questions',
    'question_options',
    'assessment_attempts',
    'assessment_answers',
    'applications',
    'interviews',
    'institution_company_access_requests',
    'institution_company_shared_students',
    'students',
    'institutions',
    'companies'
  ];

  for (const t of tables) {
    const cols = await rm.pg.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [t]);
    console.log(`\n=== Table: ${t} ===`);
    cols.rows.forEach(c => {
      if (c.column_name.includes('id') || c.column_name.includes('status') || c.column_name.includes('code')) {
        console.log(`  ${c.column_name.padEnd(25)} : ${c.data_type} (${c.udt_name})`);
      }
    });
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
