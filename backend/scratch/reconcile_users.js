const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function checkUsers() {
  const syntheticQuery = `
    SELECT id, email, created_at, auth_provider
    FROM users 
    WHERE email LIKE 'nexus.tester.%@gmail.com' 
       OR email LIKE 'new.graduate.%@demo.skillnexus.ai'
       OR email LIKE 'test.student.%'
       OR email LIKE 'recruiter.%'
    ORDER BY created_at ASC;
  `;
  const synthRes = await pool.query(syntheticQuery);
  console.log('Synthetic accounts matched:', synthRes.rows.length);
  synthRes.rows.forEach(r => console.log(` - [${r.id}] ${r.email} (${r.auth_provider}) created ${r.created_at}`));

  const allUsersRes = await pool.query('SELECT COUNT(*) FROM users');
  console.log('Total users in PostgreSQL:', allUsersRes.rows[0].count);

  const baselineUsersRes = await pool.query(`
    SELECT id, email, auth_provider, created_at 
    FROM users 
    WHERE email NOT LIKE 'nexus.tester.%@gmail.com' 
      AND email NOT LIKE 'new.graduate.%@demo.skillnexus.ai'
    ORDER BY created_at ASC;
  `);
  console.log('Baseline legitimate users count:', baselineUsersRes.rows.length);
  baselineUsersRes.rows.forEach((r, i) => console.log(`  ${i+1}. ${r.email}`));

  pool.end();
}

checkUsers().catch(console.error);
