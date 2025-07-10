import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Public } from '../auth/decorators/public.decorators';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // 'file': inside the form-data, the key should be 'file' and the value will be the file itself
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('File uploaded: ', file);
    return this.uploadsService.uploadFile(file);
    // return {
    //   originalName: file.originalname,
    //   mimetype: file.mimetype,
    //   fileName: file.filename,
    // };
  }
}
