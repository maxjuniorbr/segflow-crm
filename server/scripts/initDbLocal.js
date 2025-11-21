import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

if (process.env.NODE_ENV === 'production') {
  console.error("❌ This script should NOT be run in production!");
  process.exit(1);
}

const createTables = async () => {
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
    console.log("Connected to 'segflow_crm'. Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        persontype VARCHAR(20) DEFAULT 'Física',
        cpf VARCHAR(20),
        cnpj VARCHAR(20),
        rg VARCHAR(20),
        rgdispatchdate DATE,
        rgissuer VARCHAR(50),
        birthdate DATE,
        maritalstatus VARCHAR(50),
        email VARCHAR(255),
        phone VARCHAR(50),
        address JSONB,
        notes TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(255) PRIMARY KEY,
        clientid VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        type VARCHAR(50),
        company VARCHAR(100),
        documentnumber VARCHAR(100),
        startdate DATE,
        enddate DATE,
        status VARCHAR(50),
        attachmentname VARCHAR(255),
        notes TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created/verified successfully.");
    console.log("\nDatabase initialization complete.");
    console.log("You can now register your first user via the /api/register endpoint.");

    client.release();
  } catch (err) {
    console.error("Error initializing tables:", err);
  } finally {
    await pool.end();
  }
};

createTables();

