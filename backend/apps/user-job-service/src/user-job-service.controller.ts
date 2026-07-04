import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserJobServiceService } from './user-job-service.service';

@Controller()
export class UserJobServiceController {
  constructor(private readonly userJobServiceService: UserJobServiceService) {}

  @MessagePattern({ cmd: 'create_job' })
  async createJob(@Payload() data: any) {
    const job = await this.userJobServiceService.createJob(data);
    return {
      status: 'success',
      job,
    };
  }

  @MessagePattern({ cmd: 'get_jobs' })
  async getJobs() {
    return this.userJobServiceService.getJobs();
  }
}
