import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory (one level up from scripts)
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Initialize database schema for SegFlow CRM
 * Creates the database if it doesn't exist and sets up all required tables
 * 
 * Tables:
 * - users: Application users with authentication credentials
 * - clients: Customer records with personal and contact information
 * - documents: Insurance documents linked to clients
 */
const createTables = async () => {
  // 1. Connect to default 'postgres' database to check/create target DB
  const defaultPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL.replace('/segflow_crm', '/postgres'),
  });

  try {
    const client = await defaultPool.connect();

    // Check if database exists
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
    // If we can't connect to postgres db, we might be on a provider that doesn't allow it
    // We'll proceed and hope the DB exists or the user handles it
  } finally {
    await defaultPool.end();
  }

  // 2. Connect to the actual 'segflow_crm' database
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log("Connected to 'segflow_crm'. Creating tables...");

    // Users Table - stores authentication credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Clients Table - stores customer information
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        personType VARCHAR(20) DEFAULT 'Física',
        cpf VARCHAR(20),
        cnpj VARCHAR(20),
        rg VARCHAR(20),
        rgDispatchDate DATE,
        rgIssuer VARCHAR(50),
        birthDate DATE,
        maritalStatus VARCHAR(50),
        email VARCHAR(255),
        phone VARCHAR(50),
        address JSONB,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Documents Table - stores insurance documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(255) PRIMARY KEY,
        clientId VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
        type VARCHAR(50),
        company VARCHAR(100),
        documentNumber VARCHAR(100),
        startDate DATE,
        endDate DATE,
        status VARCHAR(50),
        attachmentName VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Helper to add column if not exists
    const addColumnIfNotExists = async (tableName, columnName, columnDef) => {
      const checkRes = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [tableName, columnName]);

      if (checkRes.rowCount === 0) {
        console.log(`Adding missing column ${columnName} to ${tableName}...`);
        await client.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
        console.log(`Column ${columnName} added.`);
      }
    };

    // Ensure new columns exist (Auto-migration)
    await addColumnIfNotExists('clients', 'personType', "VARCHAR(20) DEFAULT 'Física'");
    await addColumnIfNotExists('clients', 'cnpj', "VARCHAR(20)");

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

