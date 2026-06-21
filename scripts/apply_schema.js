const { Pool } = require('pg');
const fs = require('fs');

function getSsl(configString) {
  if (!configString) return undefined;
  return configString.includes('sslmode=require') || configString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined;
}

async function main() {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Usage: node scripts/apply_schema.js <DATABASE_URL>');
    process.exit(1);
  }

  const sql = fs.readFileSync('db/schema.sql', 'utf8');

  const pool = new Pool({ connectionString, ssl: getSsl(connectionString) });
  const client = await pool.connect();
  try {
    console.log('Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Schema apply failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
