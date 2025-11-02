import { Test, TestingModule } from '@nestjs/testing';
import { NewGuestController } from './new-guest.controller';
import { NewGuestService } from './new-guest.service';

describe('NewGuestController', () => {
  let newGuestController: NewGuestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NewGuestController],
      providers: [NewGuestService],
    }).compile();

    newGuestController = app.get<NewGuestController>(NewGuestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(newGuestController.getHello()).toBe('Hello World!');
    });
  });
});
