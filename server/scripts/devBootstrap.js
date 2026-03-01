import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';
const shouldReset = process.env.RESET_DB_ON_STARTUP !== 'false';

if (env !== 'development') {
  process.exit(0);
}

if (!shouldReset) {
  console.log('RESET_DB_ON_STARTUP=false; skipping local database reset.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const runScript = (scriptName) => {
  const scriptPath = path.resolve(__dirname, scriptName);
  const result = spawnSync('node', [scriptPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: env
    }
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

runScript('dropDbLocal.js');
runScript('initDbLocal.js');
runScript('seedDbLocal.js');
