import pg from '../backend/node_modules/pg/lib/index.js';

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'skillnexus_db'
});

async function inspect() {
  const client = await pool.connect();
  try {
    const notifCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='notifications'");
    console.log('Notifications columns:', notifCols.rows);

    const sharedCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='institution_company_shared_students'");
    console.log('Shared students columns:', sharedCols.rows);

    const ss = await client.query("SELECT * FROM institution_company_shared_students LIMIT 5");
    console.log('Shared rows:', ss.rows);

    const instCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='institutions'");
    console.log('Institutions columns:', instCols.rows.map(r => r.column_name));

    const asmtCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='assessment_attempts'");
    console.log('assessment_attempts columns:', asmtCols.rows.map(r => r.column_name));
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
