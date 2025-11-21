import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const initDbProd = async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();

    if (process.env.RESET_DB === 'true') {
      await client.query('DROP TABLE IF EXISTS documents CASCADE');
      await client.query('DROP TABLE IF EXISTS clients CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      console.log("Tables dropped successfully.");
    }

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

    console.log("Database initialization complete.");

    client.release();
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initDbProd();
