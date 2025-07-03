import { Test, TestingModule } from '@nestjs/testing';
import { FollowUpGatewayController } from './follow-up-gateway.controller';
import { FollowUpGatewayService } from './follow-up-gateway.service';

describe('FollowUpGatewayController', () => {
  let followUpGatewayController: FollowUpGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FollowUpGatewayController],
      providers: [FollowUpGatewayService],
    }).compile();

    followUpGatewayController = app.get<FollowUpGatewayController>(FollowUpGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(followUpGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
