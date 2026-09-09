require('../backend/node_modules/dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

async function main() {
  const tables = await rm.pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('\n--- ALL PUBLIC TABLES ---');
  console.log(tables.rows.map(r => r.table_name).join(', '));

  for (const t of ['students', 'student_skills', 'skills', 'skill_evidence']) {
    console.log(`\n=== ${t.toUpperCase()} ===`);
    const cols = await rm.pg.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", [t]);
    cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}, nullable=${r.is_nullable}, default=${r.column_default})`));
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
