import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { readFile, utils } from 'xlsx';
import * as xlsx from 'xlsx';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  constructor(
    @Inject('UPLOAD_CLIENT') private uploadsClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async uploadExcelFile(payload: FileProcessingPayload) {
    this.uploadsClient.emit('uploads.uploadExcelFile', payload);
    this.logger.log('File received in uploads service:-', payload.fieldname)
    return {
      message: 'File received and queued for processing.',
      fileName: payload.originalname,
    };
  }

  async uploadMultipleExcelFiles(payloads: FileProcessingPayload[]) {
    let i = payloads.length;
    payloads.forEach((payload) => {
      this.uploadsClient.emit('uploads.uploadExcelFile', payload);

      this.logger.log('File sent for processing:- ', payload.fieldname)
      this.logger.log(`${i} files remaining for processing.`)
      i -=1;
    })
    return {
      message: `${payloads.length} files have been queued for processing.`,
    };
  }

  async exampleUpload(name: string, age: number) {
    this.uploadsClient.emit('example.upload', { name, age });
    // return await firstValueFrom(this.uploadsClient.send('example.upload', {name, age}))
    return { message: 'Example upload received', name, age };
  }
}
