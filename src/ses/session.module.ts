import { Module } from '@nestjs/common';
import { SessionService } from './sesssion.service';

@Module({
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
