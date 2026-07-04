import { Controller, Get } from '@nestjs/common';
import { StellarServiceService } from './stellar-service.service';

@Controller()
export class StellarServiceController {
  constructor(private readonly stellarServiceService: StellarServiceService) {}
}
