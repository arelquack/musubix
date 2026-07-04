import { Test, TestingModule } from '@nestjs/testing';
import { UserJobServiceController } from './user-job-service.controller';
import { UserJobServiceService } from './user-job-service.service';

describe('UserJobServiceController', () => {
  let userJobServiceController: UserJobServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserJobServiceController],
      providers: [UserJobServiceService],
    }).compile();

    userJobServiceController = app.get<UserJobServiceController>(UserJobServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(userJobServiceController.getHello()).toBe('Hello World!');
    });
  });
});
