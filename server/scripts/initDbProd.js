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
        console.log('Conectando ao PostgreSQL...');
        const client = await pool.connect();
        console.log('✓ Conectado ao banco de dados');

        console.log('Criando tabelas...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✓ Tabela users criada/verificada');

        await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        cpf_cnpj VARCHAR(50),
        person_type VARCHAR(20),
        address JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        console.log('✓ Tabela clients criada/verificada');

        await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        client_id VARCHAR(50) REFERENCES clients(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        company VARCHAR(255),
        document_number VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50),
        notes TEXT,
        attachment_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        console.log('✓ Tabela documents criada/verificada');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
    `);
        console.log('✓ Índice idx_clients_user_id criado/verificado');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
    `);
        console.log('✓ Índice idx_documents_client_id criado/verificado');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    `);
        console.log('✓ Índice idx_documents_user_id criado/verificado');

        client.release();
        console.log('\n✅ Inicialização concluída com sucesso!');

    } catch (err) {
        console.error('❌ Erro durante inicialização:', err);
        throw err;
    } finally {
        await pool.end();
    }
};

initDbProd()
    .then(() => {
        console.log('Script finalizado');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Falha na inicialização:', err);
        process.exit(1);
    });
