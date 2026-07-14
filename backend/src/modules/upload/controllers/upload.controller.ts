import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { ApiResponse } from '@/shared/api/ApiResponse';

export class UploadController {
  private uploadService = new UploadService();

  uploadSingle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json(new ApiResponse(400, null, 'No file was uploaded'));
        return;
      }
      const result = await this.uploadService.uploadFile(file);
      res.status(200).json(new ApiResponse(200, result, 'File uploaded successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { publicId } = req.body;
      await this.uploadService.deleteFile(publicId);
      res.status(200).json(new ApiResponse(200, null, 'Asset deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
