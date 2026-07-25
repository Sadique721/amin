import { cloudinary } from '@/config/cloudinary.config';
import { env } from '@/config/env';
import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const cloudinaryUploader = {
  uploadBuffer: async (buffer: Buffer, folder = 'sanab'): Promise<UploadResult> => {
    // If Cloudinary keys are configured, use Cloudinary
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        stream.end(buffer);
      });
    }

    // Otherwise, fallback to local storage (mock/development uploader)
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
    const uploadsDir = path.join(process.cwd(), 'storage/uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    // Return local URL path
    return {
      url: `http://localhost:${env.PORT || 5000}/uploads/${fileName}`,
      publicId: `local-${fileName}`,
    };
  },

  deleteAsset: async (publicId: string): Promise<void> => {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      if (!publicId.startsWith('local-')) {
        await cloudinary.uploader.destroy(publicId);
        return;
      }
    }

    // Local delete
    if (publicId.startsWith('local-')) {
      const fileName = path.basename(publicId.replace('local-', ''));
      const uploadsDir = path.join(process.cwd(), 'storage/uploads');
      const filePath = path.join(uploadsDir, fileName);
      const resolvedPath = path.resolve(filePath);
      
      if (resolvedPath.startsWith(path.resolve(uploadsDir))) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
  }
};
