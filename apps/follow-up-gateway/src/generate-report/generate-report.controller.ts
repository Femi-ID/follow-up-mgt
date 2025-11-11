import { Body, Controller, Header, Post, Query, Res, ValidationPipe } from '@nestjs/common';
import { GenerateReportService } from './generate-report.service';
import { Public } from '../auth/decorators/public.decorators';
import { QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';

@Controller('reports')
export class GenerateReportController {
  constructor(private readonly generateReportService: GenerateReportService) {}

  @Public()
  @Post('generate-pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="analytics-report.pdf"')
  async generateAnalyticsPdf(
    // @Query() query: QueryAnalyticsDto,
    @Body() body: { query: QueryAnalyticsDto; data?: any[]},
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.generateReportService.generateAnalyticsPdf(body.query, body.data);
  }
}
