import { Controller } from '@nestjs/common';
import { NewGuestService } from './new-guest.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NewGuestPatterns } from '@app/contracts/new-guest/constants/message-patterns';
import { QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';

@Controller('new-guest-analytics-controller')
export class NewGuestAnalyticsController {
    constructor(private readonly newGuestService: NewGuestService) {}

    @MessagePattern(NewGuestPatterns.GET_ANALYTICS_SUMMARY)
    async getSummaryAnalytics(@Payload() payload: QueryAnalyticsDto) {
        console.log('from new-guest analytics controller')
        return this.newGuestService.getAnalyticsSummary(payload)
    }
}
