import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { readFile, utils } from 'xlsx';
import * as xlsx from 'xlsx';

@Injectable()
export class UploadsService {
  constructor(
    @Inject('UPLOAD_CLIENT') private uploadsClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async uploadExcelFile(payload: FileProcessingPayload) {
    this.uploadsClient.emit('uploads.uploadExcelFile', payload);
    console.log('File received in uploads service:-', payload.fieldname)
    return {
      message: 'File received and queued for processing.',
      fileName: payload.originalname,
    };
  }

  async processExcelFile(file: Express.Multer.File) {
    // Convert Excel buffer to JSON
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet); // returns an array of objects
    const redisKey = `file-upload_${Date.now()}_${file.originalname}`;
    try {
      await this.cacheManager.set('new_data', {'name': 'femii', 'age': 19})
      const exampleRedisObject = await this.cacheManager.get('new_data');
      console.log('exampleRedisObject::', exampleRedisObject)


      await this.cacheManager.set(redisKey, JSON.stringify(jsonData)); // Store JSON in Redis
      console.log('Redis set success:', redisKey);

      const redisExcelFile = await this.cacheManager.get(redisKey);
      if (!exampleRedisObject)
        throw new BadRequestException('File not found in Redis or expired.');
      console.log('file', file.originalname);
    } catch (err) {
      console.error('Redis set failed', err);
    }

    const filePayload: FileProcessingPayload = {
      filePath: redisKey,
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
    this.uploadsClient.emit('uploads.uploadExcelFile', filePayload);
    return {
      message: 'File received and queued for processing.',
      fileName: file.originalname,
    };
  }
  // const workbook = readFile(file.path);
  // const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // const jsonData = utils.sheet_to_json(sheet);

  async exampleUpload(name: string, age: number) {
    this.uploadsClient.emit('example.upload', { name, age });
    // return await firstValueFrom(this.uploadsClient.send('example.upload', {name, age}))
    return { message: 'Example upload received', name, age };
  }
}
