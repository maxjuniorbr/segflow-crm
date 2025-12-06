import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TABLE_STATEMENTS, INDEX_STATEMENTS } from './schemaDefinition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL_PROD) {
  console.error("This script should NOT be run in development without DATABASE_URL_PROD!");
  process.exit(1);
}

const RESET_DB = false;

const createSchema = async (client) => {
  console.log('Creating tables...');
  for (const statement of TABLE_STATEMENTS) {
    await client.query(statement);
  }

  console.log('Applying indexes and unique constraints...');
  for (const statement of INDEX_STATEMENTS) {
    await client.query(statement);
  }

  console.log('Schema creation complete.');
};

const run = async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log("Connected to database.");

    if (RESET_DB) {
      console.log("RESET_DB is true. Dropping all tables...");
      await client.query('DROP TABLE IF EXISTS documents CASCADE');
      await client.query('DROP TABLE IF EXISTS brokers CASCADE');
      await client.query('DROP TABLE IF EXISTS clients CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      console.log("Tables dropped successfully.");
    }

    await createSchema(client);
    console.log('\nDatabase initialization complete.');

    client.release();
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
