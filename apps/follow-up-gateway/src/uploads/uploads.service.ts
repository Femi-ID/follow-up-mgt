import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { readFile, utils } from 'xlsx';

@Injectable()
export class UploadsService {
  constructor(@Inject('UPLOAD_CLIENT') private uploadsClient: ClientProxy) {}

  async uploadFile(file: Express.Multer.File) {
    return await firstValueFrom(this.uploadsClient.send('uploads.uploadFile', file));
  }
  // const workbook = readFile(file.path);
  // const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // const jsonData = utils.sheet_to_json(sheet);
}
