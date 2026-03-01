#!/usr/bin/env bash
set -euo pipefail

# Install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create user/database and pre-install extensions as superuser
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'segflow_user') THEN
    CREATE ROLE segflow_user WITH LOGIN PASSWORD 'segflow_pass';
  END IF;
END $$;

DROP DATABASE IF EXISTS segflow_crm;
CREATE DATABASE segflow_crm OWNER segflow_user;
GRANT ALL PRIVILEGES ON DATABASE segflow_crm TO segflow_user;
\connect segflow_crm
CREATE EXTENSION IF NOT EXISTS pg_trgm;
GRANT ALL ON SCHEMA public TO segflow_user;
SQL

# Install dependencies
( cd server && npm install )
( npm install )

# Reset lockfile changes caused by Node version differences
git checkout -- .

# Create .env for server
cat <<'ENV' > server/.env
PORT=3001
NODE_ENV=test
DATABASE_URL=postgresql://segflow_user:segflow_pass@localhost:5432/segflow_crm
JWT_SECRET=segflow_jules_secret_key_for_testing_only_1234
RESET_DB_ON_STARTUP=false
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENV

# Initialize schema (force development mode for local DB scripts)
( cd server && NODE_ENV=development node scripts/initDbLocal.js )

# Run tests
export NODE_ENV=test
( cd server && npm run test )
npm run test
