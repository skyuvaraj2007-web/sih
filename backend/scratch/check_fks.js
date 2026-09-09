const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function checkForeignKeys() {
  const query = `
    SELECT id, email FROM users 
    WHERE email LIKE 'nexus.tester.%@gmail.com' 
       OR email LIKE 'new.graduate.%@demo.skillnexus.ai';
  `;
  const res = await pool.query(query);
  const ids = res.rows.map(r => r.id);
  console.log(`Checking ${ids.length} test accounts for foreign key references...`);

  const tables = [
    { table: 'students', col: 'user_id' },
    { table: 'companies', col: 'user_id' },
    { table: 'institutions', col: 'user_id' },
    { table: 'user_roles', col: 'user_id' }
  ];

  for (const t of tables) {
    try {
      const check = await pool.query(`SELECT COUNT(*) FROM ${t.table} WHERE ${t.col} = ANY($1)`, [ids]);
      console.log(` - ${t.table}.${t.col}: ${check.rows[0].count} references`);
    } catch(err) {
      console.log(` - ${t.table}.${t.col}: Error checking (${err.message})`);
    }
  }

  pool.end();
}

checkForeignKeys().catch(console.error);
