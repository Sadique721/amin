import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { logger } from '@/shared/logger';

export const dbBackupJob = async (): Promise<void> => {
  const backupsDir = path.join(process.cwd(), 'storage/backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionBackupDir = path.join(backupsDir, timestamp);
  fs.mkdirSync(sessionBackupDir, { recursive: true });

  try {
    const modelNames = mongoose.modelNames();
    logger.info(`[DB-BACKUP JOB] Starting database backup for models: ${modelNames.join(', ')}`);

    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      const data = await Model.find({}).lean();
      const filePath = path.join(sessionBackupDir, `${modelName.toLowerCase()}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`[DB-BACKUP JOB] Backed up model ${modelName} (${data.length} records)`);
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
