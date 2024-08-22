import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadImageService {
  // async validateImage(file: Express.Multer.File): Promise<string> {
  //   if (file.size > 2000000) {
  //     throw new BadRequestException('File is too large');
  //   }

  //   const validFileTypes = ['.png', '.jpeg', '.jpg'];
  //   const fileExt = path.extname(file.originalname).toLowerCase();
  //   if (!validFileTypes.includes(fileExt)) {
  //     throw new BadRequestException('Invalid file type');
  //   }

  //   const filePath = `/images/avatars/${file.filename}`;
  //   return filePath;
  // }
  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(path.join(__dirname, '../../'), fileName);

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File does not exist
            throw new NotFoundException('File not found');
          } else {
            // Other errors
            reject(err);
          }
        } else {
          resolve();
        }
      });
    });
  }
}
