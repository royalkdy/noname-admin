import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}
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

  async onModuleDestroy() {
    await Promise.all([this.dataClient.quit()]);
  }
}
