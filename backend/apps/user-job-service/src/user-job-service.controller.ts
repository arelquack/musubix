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
  getJobs(query: any) {
    return this.userJobServiceService.getJobs(query);
  }

  @MessagePattern({ cmd: 'accept_job' })
  acceptJob(data: { jobId: string; freelancerId: string }) {
    return this.userJobServiceService.acceptJob(data.jobId, data.freelancerId);
  }

  @MessagePattern({ cmd: 'lock_escrow' })
  lockEscrow(data: { jobId: string }) {
    return this.userJobServiceService.lockEscrow(data.jobId);
  }

  @MessagePattern({ cmd: 'submit_work' })
  submitWork(data: { jobId: string; workSubmission: string }) {
    return this.userJobServiceService.submitWork(data.jobId, data.workSubmission);
  }

  @MessagePattern({ cmd: 'approve_work' })
  approveWork(data: { jobId: string }) {
    return this.userJobServiceService.approveWork(data.jobId);
  }
}
