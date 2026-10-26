const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function cleanupSyntheticUsers() {
  const selectQuery = `
    SELECT id, email FROM users 
    WHERE email LIKE 'nexus.tester.%@gmail.com' 
       OR email LIKE 'new.graduate.%@demo.skillnexus.ai';
  `;
  const toDelete = await pool.query(selectQuery);
  console.log(`Found ${toDelete.rows.length} synthetic accounts to safely remove.`);

  if (toDelete.rows.length > 0) {
    const delRes = await pool.query(`
      DELETE FROM users 
      WHERE email LIKE 'nexus.tester.%@gmail.com' 
         OR email LIKE 'new.graduate.%@demo.skillnexus.ai';
    `);
    console.log(`Safely deleted ${delRes.rowCount} synthetic test rows from users table.`);
  }

  const finalRes = await pool.query('SELECT COUNT(*) FROM users');
  console.log(`Final PostgreSQL users count: ${finalRes.rows[0].count}`);

  const listRes = await pool.query('SELECT id, email, auth_provider FROM users ORDER BY created_at ASC');
  listRes.rows.forEach((r, idx) => console.log(` ${idx + 1}. [${r.auth_provider}] ${r.email}`));

  pool.end();
}

cleanupSyntheticUsers().catch(console.error);
