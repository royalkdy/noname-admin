import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { SessionRedisClient } from './session-redis.provider';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    @Inject('SESSION_REDIS')
    private readonly sessionClient: SessionRedisClient,
  ) {}
  private dataClient!: Redis;

  onModuleInit() {
    // 데이터용 Redis
    this.dataClient = new Redis({
      host: this.config.get<string>('REDIS_DATA_HOST'),
      port: this.config.get<number>('REDIS_DATA_PORT'),
    });
  }

  getDataClient(): Redis {
    return this.dataClient;
  }
  getSessionClient(): SessionRedisClient {
    return this.sessionClient;
  }

  async onModuleDestroy() {
    await Promise.all([this.dataClient.quit()]);
  }
}
