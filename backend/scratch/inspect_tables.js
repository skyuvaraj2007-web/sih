const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function inspect() {
  const tables = [
    'institutions', 'departments', 'institution_members', 
    'students', 'users', 'user_roles', 'audit_logs'
  ];
  for (const t of tables) {
    const colRes = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [t]);
    console.log(`\n=== Table: ${t} (${colRes.rows.length} columns) ===`);
    colRes.rows.forEach(c => {
      console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default})`);
    });
  }
  pool.end();
}

inspect().catch(err => {
  console.error(err);
  pool.end();
});
