import { Module } from '@nestjs/common';
import { UserJobServiceController } from './user-job-service.controller';
import { UserJobServiceService } from './user-job-service.service';

@Module({
  imports: [],
  controllers: [UserJobServiceController],
  providers: [UserJobServiceService],
})
export class UserJobServiceModule {}
