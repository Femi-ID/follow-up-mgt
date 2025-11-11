import { GenerateReportPatterns } from '@app/contracts/generate-report/constants/message-patterns';
import { NewGuestPatterns } from '@app/contracts/new-guest/constants/message-patterns';
import { QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';
import { Inject, Injectable, Logger, StreamableFile } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GenerateReportService {
  private readonly logger = new Logger(GenerateReportService.name);
  constructor(
    @Inject('GENERATE_REPORT_CLIENT') private generateReportClient: ClientProxy,
    @Inject('NEW_GUEST_CLIENT') private newGuestClient: ClientProxy,
  ) {}

  async generateAnalyticsPdf(query: QueryAnalyticsDto, data?: any[]) {
    this.logger.log(
      'GENERATE ANALYTICS REPORT request sent to generate report microservice.',
    );

    // let analyticsData = data
    // if (!analyticsData || analyticsData.length === 0) {
    //     this.logger.log('No data provided, fetching from new-guest-service...');
    //     analyticsData = await firstValueFrom(this.newGuestClient.send<any[]>(NewGuestPatterns.GET_ANALYTICS_SUMMARY, query));
    // }
    const base64Pdf = await firstValueFrom<string>(
      this.generateReportClient.send(
        GenerateReportPatterns.GENERATE_ANALYTICS_PDF,
        { query, data },
      ),
    );
    const pdfBuffer = Buffer.from(base64Pdf, 'base64')
    return new StreamableFile(pdfBuffer);
  }
}
