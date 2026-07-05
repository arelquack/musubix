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

  @MessagePattern({ cmd: 'get_treasury' })
  getTreasury() {
    return { issuerPubKey: this.userJobServiceService['stellarService'].getTreasuryPubKey() };
  }

  @MessagePattern({ cmd: 'accept_job' })
  acceptJob(data: { jobId: string; freelancerPubKey: string }) {
    return this.userJobServiceService.acceptJob(data.jobId, data.freelancerPubKey);
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
  approveWork(data: { jobId: string; rating?: number; review?: string }) {
    return this.userJobServiceService.approveWork(data.jobId, data.rating, data.review);
  }

  @MessagePattern({ cmd: 'sync_status' })
  syncStatus(data: { jobId: string; status: string }) {
    return this.userJobServiceService.syncStatus(data.jobId, data.status);
  }

  @MessagePattern({ cmd: 'analyze_job' })
  analyzeJob(data: { title: string; description: string; budget: string }) {
    return this.userJobServiceService.analyzeJobSpecs(data.title, data.description, data.budget);
  }

  @MessagePattern({ cmd: 'get_freelancer' })
  getFreelancer(data: { pubkey: string }) {
    return this.userJobServiceService.getFreelancerProfile(data.pubkey);
  }

  @MessagePattern({ cmd: 'get_stats' })
  getStats() {
    return this.userJobServiceService.getStats();
  }
}
