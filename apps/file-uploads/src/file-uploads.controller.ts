import { Controller, Get } from '@nestjs/common';
import { FileUploadsService } from './file-uploads.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';

@Controller()
export class FileUploadsController {
  constructor(private readonly fileUploadsService: FileUploadsService) {}

  @EventPattern('uploads.uploadExcelFile')
  async uploadExcelFile(@Payload() payload: FileProcessingPayload) {
    return await this.fileUploadsService.convertExcelFileToJson(payload)
  }

  @EventPattern('example.upload')
  async exampleUpload(@Payload() payload: { name: string; age: number}) {
    return await this.fileUploadsService.exampleUpload(payload.name, payload.age)
  }

  // async processMultipleFiles(payload: FileProcessingPayload) {
  //   for (const file of payload.files) {
  //     await this.fileUploadsService.convertExcelFileToJson(file)
  //   }
  // }
}