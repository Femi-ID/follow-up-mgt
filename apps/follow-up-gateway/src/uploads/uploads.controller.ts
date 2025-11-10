import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { Public } from '../auth/decorators/public.decorators';
import { UploadsService } from './uploads.service';
import { diskStorage } from 'multer';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from 'apps/users/src/enums/roles.enums';


// Construct the path from the project's root directory
console.log(process.cwd())
const tempFileFolder = join(process.cwd(), 'libs', 'contracts', 'src', 'uploads', 'excel-files');
@Controller('uploads')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private uploadsService: UploadsService) {}

  // @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Public()
  @Post('single-file/upload')
  @UseInterceptors(
    FileInterceptor('file', { // 'file': inside the form-data, the key should be 'file' and the value: file itself
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, tempFileFolder); // Set the destination folder for uploaded files
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
          console.log('File name: ', fileName);
          callback(null, fileName);
        },
      }),
    }),
  )
  async uploadExcelFile(
    @UploadedFile() file: Express.Multer.File | Express.Multer.File[],
    // @Param('date') date: string,
    @Query('date') serviceDate?: string,
  ) {
    console.log('Received serviceDate in controller:', serviceDate);
    // Check if file is an array (multiple files uploaded)
    if (Array.isArray(file) && file.length > 1) {
      return await this.uploadMultipleExcelFiles(file);
    }

    // To handle single file upload
    const singleFile = Array.isArray(file) ? file[0] : file;
    console.log('single file from user', singleFile)
    const payload: FileProcessingPayload = {
      filePath: singleFile.path,
      fieldname: singleFile.fieldname,
      originalname: singleFile.originalname,
      mimetype: singleFile.mimetype,
      buffer: null, // optional now cause we have file path
      // uploadedBy: userId,
    };
    return await this.uploadsService.uploadExcelFile(payload, serviceDate);
  }


  // @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Public()
  @Post('multiple-files')
  @UseInterceptors(
    FilesInterceptor('files', 10, { // limit set to 10 files
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, tempFileFolder);
          // console.log('File destination:', tempFileFolder);
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
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    // To map all files to their processing payloads
    const payloads: FileProcessingPayload[] = files.map((file) => ({
      filePath: file.path,
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: null, // Let the service read the file from the path
    }));

    this.logger.log(`Sending ${payloads.length} files for processing.`);
    return await this.uploadsService.uploadMultipleExcelFiles(payloads);
  }

  @Public()
  @Post('example')
  async exampleUpload(@Body() data: { name: string; age: number }) {
    return this.uploadsService.exampleUpload(data.name, data.age);
  }
}
