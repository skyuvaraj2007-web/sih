require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

async function main() {
  const tables = ['interviews', 'student_module_progress', 'applications', 'application_stage_history', 'enrollments', 'notifications'];
  for (const table of tables) {
    const res = await rm.pg.query(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n=== Table: ${table} ===`);
    console.table(res.rows);
  }
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });
