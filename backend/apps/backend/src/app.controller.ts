import { Controller, Get, Post, Patch, Body, Inject, Query, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('USER_JOB_SERVICE') private readonly userJobClient: ClientProxy,
  ) {}

  @Post('jobs')
  createJob(@Body() createJobDto: any) {
    return this.userJobClient.send({ cmd: 'create_job' }, createJobDto);
  }

  @Get('jobs')
  getJobs(@Query() query: any) {
    return this.userJobClient.send({ cmd: 'get_jobs' }, query);
  }

  @Get('jobs/treasury')
  getTreasury() {
    return this.userJobClient.send({ cmd: 'get_treasury' }, {});
  }

  @Post('jobs/:id/accept')
  acceptJob(@Param('id') id: string, @Body() body: { freelancerPubKey: string }) {
    return this.userJobClient.send({ cmd: 'accept_job' }, { jobId: id, freelancerPubKey: body.freelancerPubKey });
  }

  @Post('jobs/:id/lock')
  lockEscrow(@Param('id') id: string) {
    return this.userJobClient.send({ cmd: 'lock_escrow' }, { jobId: id });
  }

  @Post('jobs/:id/submit')
  submitWork(@Param('id') id: string, @Body() body: { workSubmission: string }) {
    return this.userJobClient.send({ cmd: 'submit_work' }, { jobId: id, workSubmission: body.workSubmission });
  }

  @Post('jobs/:id/approve')
  approveWork(@Param('id') id: string, @Body() body: { rating?: number; review?: string }) {
    return this.userJobClient.send({ cmd: 'approve_work' }, { jobId: id, rating: body.rating, review: body.review });
  }

  @Post('jobs/:id/sync')
  syncStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userJobClient.send({ cmd: 'sync_status' }, { jobId: id, status: body.status });
  }

  @Post('jobs/analyze')
  analyzeJob(@Body() body: { title: string; description: string; budget: string }) {
    return this.userJobClient.send({ cmd: 'analyze_job' }, body);
  }

  @Get('jobs/freelancers/:pubkey')
  getFreelancerProfile(@Param('pubkey') pubkey: string) {
    return this.userJobClient.send({ cmd: 'get_freelancer' }, { pubkey });
  }

  @Get('jobs/stats')
  getStats() {
    return this.userJobClient.send({ cmd: 'get_stats' }, {});
  }

  @Post('auth/login')
  authLogin(@Body() body: { email: string }) {
    return this.userJobClient.send({ cmd: 'auth_login' }, { email: body.email });
  }

  @Post('sign-transaction')
  signTransaction(@Body() body: { userId: string; xdr: string }) {
    return this.userJobClient.send({ cmd: 'sign_transaction' }, { userId: body.userId, xdr: body.xdr });
  }

  @Patch('profile')
  updateProfile(@Body() body: { pubKey: string; bio?: string; skills?: string; avatarUrl?: string }) {
    return this.userJobClient.send({ cmd: 'update_profile' }, body);
  }
}
