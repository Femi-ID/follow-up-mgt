import { Body, Controller, Get } from '@nestjs/common';
import { FollowUpGatewayService } from './follow-up-gateway.service';

@Controller()
export class FollowUpGatewayController {
  constructor(private readonly followUpGatewayService: FollowUpGatewayService) {}

}
