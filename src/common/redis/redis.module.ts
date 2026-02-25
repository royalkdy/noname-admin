import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { sessionRedisProvider } from './session-redis.provider';

@Global()
@Module({
  providers: [RedisService, sessionRedisProvider],
  exports: [RedisService, 'SESSION_REDIS'],
})
export class RedisModule {}
