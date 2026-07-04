import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
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
  getJobs() {
    // Forward the HTTP request to the microservice
    return this.userJobClient.send({ cmd: 'get_jobs' }, {});
  }
}
