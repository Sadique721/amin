import fs from 'fs';
import path from 'path';
import { logger } from '@/shared/logger';

export const cleanTempJob = async (): Promise<void> => {
  const tempDir = path.join(process.cwd(), 'storage/temp');
  if (!fs.existsSync(tempDir)) {
    return;
  }

  try {
    const files = await fs.promises.readdir(tempDir);
    const now = Date.now();
    const threshold = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.promises.stat(filePath);
      if (now - stats.mtimeMs > threshold) {
        await fs.promises.rm(filePath, { recursive: true, force: true });
        logger.info(`[CLEAN-TEMP JOB] Deleted old temp file/folder: ${file}`);
      }
    }
  } catch (error) {
    logger.error(`[CLEAN-TEMP JOB ERROR] Failed to clean temp files: ${(error as Error).message}`);
  }
};
