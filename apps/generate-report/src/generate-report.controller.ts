import { Controller, Get } from '@nestjs/common';
import { GenerateReportService } from './generate-report.service';
import { MessagePattern } from '@nestjs/microservices';
import { GenerateReportPatterns } from '@app/contracts/generate-report/constants/message-patterns';
import { QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';

@Controller()
export class GenerateReportController {
  constructor(private readonly generateReportService: GenerateReportService) {}

  @MessagePattern(GenerateReportPatterns.GENERATE_ANALYTICS_PDF)
  async generateAnalyticsPdf(payload: {query: QueryAnalyticsDto, data?: any[]}) {
    const { query, data } = payload;
    return this.generateReportService.generateAnalyticsPdf(query, data)
  }
}
