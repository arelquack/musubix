import { Controller, Get, Post, Body, Inject, Query, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('jobs')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('USER_JOB_SERVICE') private readonly userJobClient: ClientProxy,
  ) {}

  @Post()
  createJob(@Body() createJobDto: any) {
    // Forward the HTTP request to the microservice
    return this.userJobClient.send({ cmd: 'create_job' }, createJobDto);
  }

  @Get()
  getJobs(@Query() query: any) {
    return this.userJobClient.send({ cmd: 'get_jobs' }, query);
  }

  @Get('treasury')
  getTreasury() {
    return this.userJobClient.send({ cmd: 'get_treasury' }, {});
  }

  @Post(':id/accept')
  acceptJob(@Param('id') id: string, @Body() body: { freelancerPubKey: string }) {
    return this.userJobClient.send({ cmd: 'accept_job' }, { jobId: id, freelancerPubKey: body.freelancerPubKey });
  }

  @Post(':id/lock')
  lockEscrow(@Param('id') id: string) {
    return this.userJobClient.send({ cmd: 'lock_escrow' }, { jobId: id });
  }

  @Post(':id/submit')
  submitWork(@Param('id') id: string, @Body() body: { workSubmission: string }) {
    return this.userJobClient.send({ cmd: 'submit_work' }, { jobId: id, workSubmission: body.workSubmission });
  }

  @Post(':id/approve')
  approveWork(@Param('id') id: string, @Body() body: { rating?: number; review?: string }) {
    return this.userJobClient.send({ cmd: 'approve_work' }, { jobId: id, rating: body.rating, review: body.review });
  }

  @Post(':id/sync')
  syncStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userJobClient.send({ cmd: 'sync_status' }, { jobId: id, status: body.status });
  }

  @Post('analyze')
  analyzeJob(@Body() body: { title: string; description: string; budget: string }) {
    return this.userJobClient.send({ cmd: 'analyze_job' }, body);
  }

  @Get('/freelancers/:pubkey')
  getFreelancerProfile(@Param('pubkey') pubkey: string) {
    return this.userJobClient.send({ cmd: 'get_freelancer' }, { pubkey });
  }
}
