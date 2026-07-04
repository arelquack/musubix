import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserJobServiceService } from './user-job-service.service';

@Controller()
export class UserJobServiceController {
  constructor(private readonly userJobServiceService: UserJobServiceService) {}

  @MessagePattern({ cmd: 'create_job' })
  createJob(@Payload() data: any) {
    // In a real implementation, this would use Prisma to insert a job.
    return {
      status: 'success',
      job: { id: 'job-123', ...data },
    };
  }

  @MessagePattern({ cmd: 'get_jobs' })
  getJobs() {
    // Return dummy data matching the UI placeholders for the MVP.
    return [
      {
        id: 'job-123',
        title: 'Design Logo',
        description: 'Need a modern logo for my Web3 project. Fast turnaround preferred.',
        budgetAmount: 50,
        currency: 'USDC',
        status: 'OPEN',
      }
    ];
  }
}
