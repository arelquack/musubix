import { Test, TestingModule } from '@nestjs/testing';
import { StellarServiceController } from './stellar-service.controller';
import { StellarServiceService } from './stellar-service.service';

describe('StellarServiceController', () => {
  let stellarServiceController: StellarServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StellarServiceController],
      providers: [StellarServiceService],
    }).compile();

    stellarServiceController = app.get<StellarServiceController>(StellarServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(stellarServiceController.getHello()).toBe('Hello World!');
    });
  });
});
