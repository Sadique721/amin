import { cloudinaryUploader, UploadResult } from '@/shared/cloudinary';
import { BadRequestException } from '@/shared/exceptions';

export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return cloudinaryUploader.uploadBuffer(file.buffer);
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('No publicId provided');
    }
    await cloudinaryUploader.deleteAsset(publicId);
  }
}
