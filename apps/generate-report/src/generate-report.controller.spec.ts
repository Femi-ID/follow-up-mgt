import { Test, TestingModule } from '@nestjs/testing';
import { GenerateReportController } from './generate-report.controller';
import { GenerateReportService } from './generate-report.service';

describe('GenerateReportController', () => {
  let generateReportController: GenerateReportController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GenerateReportController],
      providers: [GenerateReportService],
    }).compile();

    generateReportController = app.get<GenerateReportController>(GenerateReportController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(generateReportController.getHello()).toBe('Hello World!');
    });
  });
});
