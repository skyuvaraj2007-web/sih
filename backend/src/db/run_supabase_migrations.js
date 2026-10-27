/**
 * SKILL NEXUS AI — Supabase Migration Runner
 * 
 * Safely applies database schema, tables, and RLS policies to the
 * Supabase PostgreSQL database specified by DATABASE_URL.
 * 
 * Usage:
 *   node backend/src/db/run_supabase_migrations.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { pool, checkHealth, isConfigured } = require('../config/db');

async function run() {
  console.log('================================================================');
  console.log('       SKILL NEXUS AI — SUPABASE SCHEMA & RLS MIGRATION         ');
  console.log('================================================================');

  if (!isConfigured() || !pool) {
    console.warn('⚠️ DATABASE_URL is not set in your .env file.');
    console.log('To run migrations automatically:');
    console.log('1. Add DATABASE_URL to your .env file with your Supabase connection string:');
    console.log('   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
    console.log('2. Alternatively, copy and execute the SQL file directly in the Supabase Dashboard SQL Editor:');
    console.log('   backend/src/db/migrations/000_supabase_complete_schema_and_rls.sql');
    console.log('================================================================\n');
    return;
  }

  console.log('[1/4] Verifying connection to Supabase PostgreSQL database...');
  const health = await checkHealth();
  if (!health.connected) {
    console.error('❌ Failed to connect to database:', health.message);
    process.exit(1);
  }
  console.log('  ✓ Connected successfully!\n');

  console.log('[2/4] Reading SQL migration file...');
  const sqlPath = path.resolve(__dirname, 'migrations/000_supabase_complete_schema_and_rls.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`  ✓ Read ${sql.length} bytes of SQL instructions.\n`);

  console.log('[3/4] Executing migration in transaction...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('  ✓ Schema and Row Level Security policies applied successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed and was rolled back:', err.message);
    client.release();
    process.exit(1);
  } finally {
    client.release();
  }

  console.log('[4/4] Verifying migrated tables...');
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log(`  ✓ Total tables in database: ${res.rows.length}`);
  const tables = res.rows.map(r => r.table_name);
  console.log('  Active tables:', tables.join(', '));

  console.log('\n================================================================');
  console.log('✓ Migration completed successfully!');
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
