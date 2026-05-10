import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EnvironmentVariables } from '../../../env.variables';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  getMulterOptions(): MulterOptions {
    const uploadDir = this.configService.get('UPLOAD_DIR', { infer: true });
    const maxSizeMb = this.configService.get('MAX_FILE_SIZE_MB', {
      infer: true,
    });

    return {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: (maxSizeMb ?? 10) * 1024 * 1024 },
    };
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
