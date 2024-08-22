import { Global, Module } from '@nestjs/common';
import { UploadImageService } from './services/upload-image.service';

@Global()
@Module({
  providers: [UploadImageService],
  exports: [UploadImageService],
})
export class CommonModule {}
