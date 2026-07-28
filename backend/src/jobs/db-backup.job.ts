import fs from 'fs';
import path from 'path';
import { getPgPool } from '@/database/connection';
import { logger } from '@/shared/logger';

export const dbBackupJob = async (): Promise<void> => {
  const backupsDir = path.join(process.cwd(), 'storage/backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionBackupDir = path.join(backupsDir, timestamp);
  fs.mkdirSync(sessionBackupDir, { recursive: true });

  const pool = getPgPool();
  if (!pool) {
    logger.warn('[DB-BACKUP JOB] PostgreSQL pool not initialized — skipping backup.');
    return;
  }
  const tables = ['users', 'categories', 'products', 'orders', 'banners', 'faqs', 'wishlist'];

  try {
    logger.info(`[DB-BACKUP JOB] Starting PostgreSQL database backup for tables: ${tables.join(', ')}`);

    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table}`);
        const filePath = path.join(sessionBackupDir, `${table}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(res.rows, null, 2), 'utf-8');
        logger.info(`[DB-BACKUP JOB] Backed up table ${table} (${res.rows.length} records)`);
      } catch (err: any) {
        logger.warn(`[DB-BACKUP JOB] Table ${table} skip/warning: ${err.message}`);
      }
    }

    // Keep only the last 7 backups to save disk space
    const folders = await fs.promises.readdir(backupsDir);
    const sortedFolders = folders
      .map((name) => ({ name, path: path.join(backupsDir, name) }))
      .filter((item) => fs.statSync(item.path).isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    if (sortedFolders.length > 7) {
      const toDelete = sortedFolders.slice(0, sortedFolders.length - 7);
      for (const item of toDelete) {
        await fs.promises.rm(item.path, { recursive: true, force: true });
        logger.info(`[DB-BACKUP JOB] Pruned old backup folder: ${item.name}`);
      }
    }
  } catch (error) {
    logger.error(`[DB-BACKUP JOB ERROR] Database backup failed: ${(error as Error).message}`);
  }
};
