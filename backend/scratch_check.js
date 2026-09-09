const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();
(async () => {
  const r = await pool.query("SELECT * FROM roles");
  console.log('roles in PG:', r.rows);
  const r2 = await pool.query("SELECT * FROM user_roles LIMIT 5");
  console.log('user_roles in PG:', r2.rows);
  pool.end();
})();
