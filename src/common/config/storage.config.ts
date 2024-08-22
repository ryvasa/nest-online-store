import { extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export const avatarsStorage = {
  storage: diskStorage({
    destination: './images/avatars',
    filename: (req, file, cb) => {
      const uniqueSuffix = uuid();
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
};

export const photosStorage = {
  storage: diskStorage({
    destination: './images/photos',
    filename: (req, file, cb) => {
      const uniqueSuffix = uuid();
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
};
