import { Controller, Get } from '@nestjs/common';
// import { FileUploadsService } from './file-uploads.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { ClaudeUploadsService } from './claude-file';
import { FileUploadsService } from './file-uploads.service';

@Controller()
export class FileUploadsController {
  constructor(
    private readonly fileUploadsService: FileUploadsService,
    private readonly claudeService: ClaudeUploadsService,
  ) {}

  @EventPattern('uploads.uploadExcelFile')
  async uploadExcelFile(
    @Payload() body: { payload: FileProcessingPayload, serviceDate?: string },
  ) {
    console.log('Received serviceDate in controller:', body.serviceDate);
    return await this.fileUploadsService.convertExcelFileToJson(
      body.payload, body.serviceDate
    );
  }

  @EventPattern('example.upload')
  async exampleUpload(@Payload() payload: { name: string; age: number }) {
    return await this.fileUploadsService.exampleUpload(
      payload.name,
      payload.age,
    );
  }

  // async processMultipleFiles(payload: FileProcessingPayload) {
  //   for (const file of payload.files) {
  //     await this.fileUploadsService.convertExcelFileToJson(file)
  //   }
  // }
}
