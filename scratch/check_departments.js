const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();
(async () => {
  const r = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'departments'");
  console.log('departments columns:', r.rows);
  const r2 = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'students'");
  console.log('students columns:', r2.rows);
  pool.end();
})();
