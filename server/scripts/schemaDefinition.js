export const TABLE_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      cpf VARCHAR(14) NOT NULL UNIQUE,
      email VARCHAR(254) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
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
  `,
  `
    CREATE TABLE IF NOT EXISTS brokers (
      id VARCHAR(255) PRIMARY KEY,
      corporatename VARCHAR(200) NOT NULL,
      tradename VARCHAR(200) NOT NULL,
      cnpj VARCHAR(18) NOT NULL UNIQUE,
      susepcode VARCHAR(20),
      contactname VARCHAR(200),
      email VARCHAR(254),
      phone VARCHAR(20),
      mobile VARCHAR(20),
      createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
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
  `
];

export const INDEX_STATEMENTS = [
  `
    CREATE UNIQUE INDEX IF NOT EXISTS unique_cpf 
    ON clients (cpf) 
    WHERE cpf IS NOT NULL AND cpf != '';
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS unique_cnpj 
    ON clients (cnpj) 
    WHERE cnpj IS NOT NULL AND cnpj != '';
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS unique_broker_cnpj
    ON brokers (cnpj)
    WHERE cnpj IS NOT NULL AND cnpj != '';
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS unique_broker_susep
    ON brokers (susepcode)
    WHERE susepcode IS NOT NULL AND susepcode != '';
  `
];
