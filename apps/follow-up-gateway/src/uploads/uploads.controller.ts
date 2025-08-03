import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Public } from '../auth/decorators/public.decorators';
import { UploadsService } from './uploads.service';
import { diskStorage } from 'multer';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';

const tempFileFolder =
  '../../../../user/PycharmProjects/nestjs/follow-up/libs/contracts/src/uploads/excel-files';
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // 'file': inside the form-data, the key should be 'file' and the value: file itself
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, tempFileFolder); // Set the destination folder for uploaded files
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadExcelFile(
    @UploadedFile() file: Express.Multer.File | Express.Multer.File[],
  ) {
    // Check if file is an array (multiple files uploaded)
    if (Array.isArray(file) && file.length > 1) {
      return await this.uploadMultipleExcelFiles(file);
    }

    // To handle single file upload
    const singleFile = Array.isArray(file) ? file[0] : file;
    console.log('file from user', singleFile)
    const payload: FileProcessingPayload = {
      filePath: singleFile.path,
      fieldname: singleFile.fieldname,
      originalname: singleFile.originalname,
      mimetype: singleFile.mimetype,
      buffer: null, // optional now cause we have file path
      // uploadedBy: userId,
    };
    return await this.uploadsService.uploadExcelFile(payload);
  }


  @Public()
  @Post('multiple-files')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, tempFileFolder);
          console.log('File destination:', tempFileFolder);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadMultipleExcelFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    for (const file of files) {
      const payload: FileProcessingPayload = {
        filePath: file.path,
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer, // optional now cause we have file path
      };
      console.log('File sent', file.originalname);
      await this.uploadsService.uploadExcelFile(payload);
    }
    // return { message: 'All files received. Processing started...' };
  }

  @Public()
  @Post('example')
  async exampleUpload(@Body() data: { name: string; age: number }) {
    return this.uploadsService.exampleUpload(data.name, data.age);
  }
}
