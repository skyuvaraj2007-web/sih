const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function checkNotNull() {
  const res = await pool.query(`
    SELECT column_name, is_nullable, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'students' 
      AND is_nullable = 'NO'
    ORDER BY ordinal_position;
  `);
  console.log('NOT NULL columns in students table:');
  res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type}) [default: ${r.column_default}]`));
  pool.end();
}

checkNotNull().catch(console.error);
