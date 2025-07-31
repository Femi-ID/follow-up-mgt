import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Public } from '../auth/decorators/public.decorators';
import { UploadsService } from './uploads.service';                                           
import { diskStorage } from 'multer';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // 'file': inside the form-data, the key should be 'file' and the value will be the file itself
      storage: diskStorage({
        destination: '../../../../user/PycharmProjects/nestjs/follow-up/libs/contracts/src/uploads/excel-files',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
          callback(null, fileName);
        },
      })
    }),
  )
  async uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    console.log('File retrieved: ', file);
    
    const payload: FileProcessingPayload = {
    filePath: file.path,
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    buffer: null, // optional now cause we have file path
    // uploadedBy: userId,
  };
    return this.uploadsService.uploadExcelFile(payload);
    // return {
    //   originalName: file.originalname,
    //   mimetype: file.mimetype,
    //   fileName: file.filename,
    // };
  }

  @Public()
  @Post('example')
  async exampleUpload(@Body() data: {name: string, age: number}) {
    return this.uploadsService.exampleUpload(data.name, data.age);
  }
}
