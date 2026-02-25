//main.ts에서 session store초기화와 런타임에서 세션 관리도 같이 위해 provider로 생성
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export type SessionRedisClient = ReturnType<typeof createClient>;

export const sessionRedisProvider = {
  provide: 'SESSION_REDIS',
  useFactory: async (config: ConfigService): Promise<SessionRedisClient> => {
    const client = createClient({
      url: `redis://${config.get('REDIS_SESSION_HOST')}:${config.get('REDIS_SESSION_PORT')}`,
    });

    await client.connect();
    return client;
  },
  inject: [ConfigService],
};
