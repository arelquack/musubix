import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { UserJobServiceModule } from './user-job-service.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(UserJobServiceModule);
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
    });

    await app.startAllMicroservices();
    await app.listen(3002); // Dummy port for HTTP just to keep the process alive
    console.log('User-Job Microservice is listening on TCP port 3001 (and HTTP 3002)');
  } catch (error) {
    console.error('Failed to start microservice:', error);
  }
}
bootstrap();
