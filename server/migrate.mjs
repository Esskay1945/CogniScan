import { readFile } from 'node:fs/promises';
import { getMigrations } from 'better-auth/db/migration';
import { createDatabase } from './database.mjs';

const { pool, auth } = createDatabase();
try {
  await pool.query('create schema if not exists cogniscan');
  const migrations = await getMigrations(auth.options);
  await migrations.runMigrations();
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log('CogniScan database migration complete.');
} catch (error) {
  console.error('CogniScan database migration failed.', error.code || error.name);
  process.exitCode = 1;
} finally {
  await pool.end();
}
