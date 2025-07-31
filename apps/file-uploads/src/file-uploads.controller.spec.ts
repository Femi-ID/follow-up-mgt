import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadsController } from './file-uploads.controller';
import { FileUploadsService } from './file-uploads.service';

describe('FileUploadsController', () => {
  let fileUploadsController: FileUploadsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadsController],
      providers: [FileUploadsService],
    }).compile();

    fileUploadsController = app.get<FileUploadsController>(FileUploadsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fileUploadsController.getHello()).toBe('Hello World!');
    });
  });
});
