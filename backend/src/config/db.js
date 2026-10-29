/**
 * SKILL NEXUS AI — Centralized PostgreSQL / Supabase Database Pool
 * 
 * Provides a unified connection pool using the 'pg' driver for:
 * - Supabase PostgreSQL (via DATABASE_URL with SSL enabled)
 * - Local PostgreSQL (when configured)
 * 
 * Invariants:
 * - Single source of connection pooling across all services.
 * - Handles idle client errors gracefully to avoid server crashes.
 * - Enforces SSL for remote Supabase connections.
 * - Exposes health check utilities without leaking credentials.
 */

const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables prioritizing backend/.env, with fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || '';

let pool = null;

if (connectionString) {
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const poolConfig = {
    connectionString,
    max: parseInt(process.env.PG_MAX_CONNECTIONS || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };

  // Supabase and any cloud-hosted PostgreSQL require SSL
  if (!isLocal || process.env.PGSSLMODE === 'require') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(poolConfig);

  pool.on('error', (err) => {
    console.warn('[PostgreSQL Pool] Idle client warning:', err.message);
  });

  console.log('[PostgreSQL Pool] Initialized connection pool for configured database');
} else {
  console.warn('[PostgreSQL Pool] DATABASE_URL is not set. Direct PostgreSQL pool is unconfigured.');
}

/**
 * Execute a query using the shared connection pool.
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('Database pool is not configured. Please set DATABASE_URL in your .env file.');
  }
  return await pool.query(text, params);
}

/**
 * Obtain a dedicated client from the pool (must be released by caller).
 */
async function getClient() {
  if (!pool) {
    throw new Error('Database pool is not configured. Please set DATABASE_URL in your .env file.');
  }
  return await pool.connect();
}

/**
 * Health check utility returning database connectivity status.
 */
async function checkHealth() {
  if (!pool) {
    return { connected: false, message: 'DATABASE_URL not configured' };
  }
  try {
    const res = await pool.query('SELECT 1 AS alive');
    return { connected: res && res.rows && res.rows.length > 0 };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}

function isConfigured() {
  return pool !== null;
}

module.exports = {
  pool,
  query,
  getClient,
  checkHealth,
  isConfigured
};
