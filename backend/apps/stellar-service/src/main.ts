import { NestFactory } from '@nestjs/core';
import { StellarServiceModule } from './stellar-service.module';

async function bootstrap() {
  const app = await NestFactory.create(StellarServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
