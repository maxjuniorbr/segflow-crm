export const TABLE_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm;`,

  `CREATE TABLE IF NOT EXISTS brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corporate_name TEXT NOT NULL CHECK (length(corporate_name) <= 200),
    trade_name TEXT NOT NULL CHECK (length(trade_name) <= 200),
    cnpj TEXT NOT NULL UNIQUE CHECK (length(cnpj) <= 20),
    susep_code TEXT CHECK (length(susep_code) <= 20),
    contact_name TEXT NOT NULL CHECK (length(contact_name) <= 200),
    email TEXT NOT NULL CHECK (length(email) <= 254),
    phone TEXT NOT NULL CHECK (length(phone) <= 20),
    mobile TEXT NOT NULL CHECK (length(mobile) <= 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) <= 200),
    cpf TEXT NOT NULL CHECK (length(cpf) <= 14),
    email TEXT NOT NULL UNIQUE CHECK (length(email) <= 254),
    password TEXT NOT NULL,
    username TEXT NOT NULL CHECK (length(username) <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) <= 200),
    person_type TEXT NOT NULL DEFAULT 'Física' CHECK (person_type IN ('Física', 'Jurídica')),
    cpf TEXT CHECK (length(cpf) <= 14),
    cnpj TEXT CHECK (length(cnpj) <= 20),
    rg TEXT CHECK (length(rg) <= 20),
    rg_dispatch_date DATE,
    rg_issuer TEXT CHECK (length(rg_issuer) <= 20),
    birth_date DATE,
    marital_status TEXT CHECK (length(marital_status) <= 30),
    email TEXT CHECK (length(email) <= 254),
    phone TEXT CHECK (length(phone) <= 20),
    address JSONB CHECK (address IS NULL OR jsonb_typeof(address) = 'object'),
    notes TEXT CHECK (length(notes) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (length(type) <= 100),
    company TEXT NOT NULL CHECK (length(company) <= 200),
    document_number TEXT CHECK (length(document_number) <= 50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Proposta' CHECK (status IN ('Proposta', 'Apólice', 'Endosso', 'Cancelado', 'Vencido')),
    attachment_name TEXT CHECK (length(attachment_name) <= 255),
    notes TEXT CHECK (length(notes) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_documents_date_range CHECK (end_date >= start_date)
  );`
];

export const TRIGGER_STATEMENTS = [
  `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = now(); RETURN NEW; END;
   $$ LANGUAGE plpgsql;`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_brokers_updated_at') THEN
       CREATE TRIGGER trg_brokers_updated_at BEFORE UPDATE ON brokers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
     END IF;
   END $$;`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
       CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
     END IF;
   END $$;`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clients_updated_at') THEN
       CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
     END IF;
   END $$;`,

  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_documents_updated_at') THEN
       CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
     END IF;
   END $$;`
];

export const INDEX_STATEMENTS = [
  // --- brokers ---
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_broker_susep ON brokers (susep_code) WHERE susep_code IS NOT NULL AND susep_code != '';`,

  // --- users ---
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_user_cpf_per_broker ON users (broker_id, cpf);`,
  `CREATE INDEX IF NOT EXISTS idx_users_broker_created ON users (broker_id, created_at DESC);`,

  // --- clients: uniqueness ---
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_cpf_per_broker ON clients (broker_id, cpf) WHERE cpf IS NOT NULL AND cpf != '';`,
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_cnpj_per_broker ON clients (broker_id, cnpj) WHERE cnpj IS NOT NULL AND cnpj != '';`,
  // --- clients: listing & pagination ---
  `CREATE INDEX IF NOT EXISTS idx_clients_broker_created ON clients (broker_id, created_at DESC, id DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_broker_person_type ON clients (broker_id, person_type);`,
  // --- clients: trigram search ---
  `CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON clients USING GIN (LOWER(name) gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_email_trgm ON clients USING GIN (LOWER(email) gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_cpf_trgm ON clients USING GIN (cpf gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_clients_cnpj_trgm ON clients USING GIN (cnpj gin_trgm_ops);`,

  // --- documents: listing & pagination ---
  `CREATE INDEX IF NOT EXISTS idx_documents_broker_created ON documents (broker_id, created_at DESC, id DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_documents_client_created ON documents (client_id, created_at DESC);`,
  // --- documents: dashboard queries ---
  `CREATE INDEX IF NOT EXISTS idx_documents_broker_status ON documents (broker_id, status);`,
  `CREATE INDEX IF NOT EXISTS idx_documents_broker_end_date ON documents (broker_id, end_date) WHERE status != 'Cancelado';`,
  // --- documents: trigram search ---
  `CREATE INDEX IF NOT EXISTS idx_documents_company_trgm ON documents USING GIN (LOWER(company) gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_documents_document_number_trgm ON documents USING GIN (LOWER(document_number) gin_trgm_ops);`,

  // --- refresh_tokens ---
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);`
];
