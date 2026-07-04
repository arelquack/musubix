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

  @Post(':id/accept')
  acceptJob(@Param('id') id: string, @Body() body: { freelancerId: string }) {
    return this.userJobClient.send({ cmd: 'accept_job' }, { jobId: id, freelancerId: body.freelancerId });
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
  approveWork(@Param('id') id: string) {
    return this.userJobClient.send({ cmd: 'approve_work' }, { jobId: id });
  }
}
