import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TABLE_STATEMENTS, TRIGGER_STATEMENTS, INDEX_STATEMENTS } from './schemaDefinition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  console.error('This script should only run in development.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env!");
  process.exit(1);
}

const RESET_DB = false;

const createSchema = async (client) => {
  console.log('Creating tables...');
  for (const statement of TABLE_STATEMENTS) {
    await client.query(statement);
  }

  console.log('Applying triggers...');
  for (const statement of TRIGGER_STATEMENTS) {
    await client.query(statement);
  }

  console.log('Applying indexes and unique constraints...');
  for (const statement of INDEX_STATEMENTS) {
    await client.query(statement);
  }

  console.log('Schema creation complete.');
};

const run = async () => {
  const defaultPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL.replace('/segflow_crm', '/postgres'),
  });

  try {
    const client = await defaultPool.connect();

    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'segflow_crm'");
    if (res.rowCount === 0) {
      console.log("Database 'segflow_crm' not found. Creating...");
      await client.query('CREATE DATABASE segflow_crm');
      console.log("Database 'segflow_crm' created successfully.");
    } else {
      console.log("Database 'segflow_crm' already exists.");
    }
    client.release();
  } catch (err) {
    console.error("Error checking/creating database:", err);
  } finally {
    await defaultPool.end();
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log("Connected to database.");

    if (RESET_DB) {
      console.log("RESET_DB is true. Dropping all tables...");
      await client.query('DROP TABLE IF EXISTS documents CASCADE');
      await client.query('DROP TABLE IF EXISTS refresh_tokens CASCADE');
      await client.query('DROP TABLE IF EXISTS clients CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      await client.query('DROP TABLE IF EXISTS brokers CASCADE');
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
