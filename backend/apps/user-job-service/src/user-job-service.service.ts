import { Injectable } from '@nestjs/common';

@Injectable()
export class UserJobServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
