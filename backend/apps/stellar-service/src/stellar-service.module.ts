import { Module } from '@nestjs/common';
import { StellarServiceController } from './stellar-service.controller';
import { StellarServiceService } from './stellar-service.service';

@Module({
  imports: [],
  controllers: [StellarServiceController],
  providers: [StellarServiceService],
})
export class StellarServiceModule {}
