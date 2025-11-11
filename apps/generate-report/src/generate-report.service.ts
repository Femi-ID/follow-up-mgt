import { GenerateReportPatterns } from '@app/contracts/generate-report/constants/message-patterns';
import { NewGuestPatterns } from '@app/contracts/new-guest/constants/message-patterns';
import { QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NewGuestService } from 'apps/new-guest/src/new-guest.service';
import * as puppeteer from 'puppeteer';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GenerateReportService {
  private readonly logger = new Logger(GenerateReportService.name)
  constructor(
    @Inject('NEW_GUEST_CLIENT') private newGuestClient: ClientProxy,
    private readonly newGuestService: NewGuestService,
  ) {}

  async generateAnalyticsPdf(query: QueryAnalyticsDto, data?: any[]) {
    try {
      let analyticsData = data
      if(!analyticsData || analyticsData.length === 0) {
        this.logger.log('No data provided, fetching from new-guest-service....')
        analyticsData = await firstValueFrom(this.newGuestClient.send(NewGuestPatterns.GET_ANALYTICS_SUMMARY, query))
      }

      // To generate PDF logic from HTML
      const html = await this.getHtmlTemplate(query, analyticsData)
      const browser = await puppeteer.launch({ args: ['--no-sandbox']})
      const page = await browser.newPage();

      // set content and wait for the chart to render
      await page.setContent(html, { waitUntil: 'networkidle0'})

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px'},
      })

      // await browser.close()
      // return pdfBuffer.toString('base64')
      const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer as any)
      return buffer.toString('base64')
    } catch (error) {
      this.logger.error('Failed to generate PDF report', error.stack)
      throw new RpcException('Failed to generate PDF report...')
    }
  }


  async getHtmlTemplate(query: QueryAnalyticsDto, data: any[]) {
    const {finalStartDate, finalEndDate } = await this.newGuestService.resolveAnalyticsQuery(query) //this.resolveAnalyticsQuery(query);

    const title = `Analytics Report from ${finalStartDate} to ${finalEndDate}`
    const dateRange = `${finalStartDate.toDateString()} to ${finalEndDate.toDateString()}`

    //Inject data for chart.js to read
    const chartDataJson = JSON.stringify(data)

    return `
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: sans-serif; }
            h1 { color: #333; }
            .chart-container { width: 800px; height: 400px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p><strong>Date Range:</strong> ${dateRange}</p>
          
          <div class="chart-container">
            <canvas id="myChart"></canvas>
          </div>

          <script>
            const data = ${chartDataJson};
            const labels = data.map(item => item.group);
            const counts = data.map(item => item.count);

            new Chart(document.getElementById('myChart'), {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [{
                  label: 'New Guests',
                  data: counts,
                  backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
              },
            });
          </script>
        </body>
      </html>
    `;
  }
}
