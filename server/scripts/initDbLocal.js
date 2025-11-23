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

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env!");
  process.exit(1);
}

const RESET_DB = false;

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
      console.log("🔄 RESET_DB is true. Dropping all tables...");
      await client.query('DROP TABLE IF EXISTS documents CASCADE');
      await client.query('DROP TABLE IF EXISTS clients CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      console.log("✅ Tables dropped successfully.");
    }

    console.log("Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        email VARCHAR(254) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        persontype VARCHAR(20) DEFAULT 'Física',
        cpf VARCHAR(14),
        cnpj VARCHAR(18),
        rg VARCHAR(20),
        rgdispatchdate DATE,
        rgissuer VARCHAR(20),
        birthdate DATE,
        maritalstatus VARCHAR(50),
        email VARCHAR(254),
        phone VARCHAR(15),
        address JSONB,
        notes VARCHAR(1000),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating unique constraints...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_cpf 
      ON clients (cpf) 
      WHERE cpf IS NOT NULL AND cpf != '';
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_cnpj 
      ON clients (cnpj) 
      WHERE cnpj IS NOT NULL AND cnpj != '';
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(255) PRIMARY KEY,
        clientid VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        type VARCHAR(50),
        company VARCHAR(100),
        documentnumber VARCHAR(50),
        startdate DATE,
        enddate DATE,
        status VARCHAR(50),
        attachmentname VARCHAR(255),
        notes VARCHAR(1000),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables created successfully.");
    console.log("✅ Unique constraints on CPF/CNPJ added.");
    console.log("\n🎉 Database initialization complete.");

    client.release();
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
