import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ErrorCode } from './common/error-code';
import passport from 'passport';
import session from 'express-session';
import { SessionRedisClient } from '@/common/redis/session-redis.provider';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Rquest DTO 검증
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: () => {
        return new BadRequestException(ErrorCode.INVALID_PARAM);
      },
    }),
  );

  //#region session store 생성
  const sessionClient = app.get<SessionRedisClient>('SESSION_REDIS');
  const redisStore = new RedisStore({
    client: sessionClient,
    ttl: Number(process.env.SESSION_TTL),
  });

  // 세션 저장소 설정
  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      rolling: true, // 활동감지시 ttl 갱신
      cookie: {
        httpOnly: true,
        maxAge: 1000 * Number(process.env.SESSION_TTL), // 쿠키 만료시간은 세션 TTL과 동일하게 설정
      },
    }),
  );
  // passport 기능 활성화
  app.use(passport.initialize());
  // serializer 작동
  app.use(passport.session());
  //#endregion

  // local용
  app.setGlobalPrefix('api/auth');
  const host = process.env.SERVER_HOST ?? '127.0.0.1';
  const port = Number(process.env.SERVER_PORT ?? 3000);

  // // docker용
  // app.setGlobalPrefix('api/auth');
  // const host = '0.0.0.0';
  // const port = 3000;

  await app.listen(port, host);
}
bootstrap().catch((err) => {
  console.error('Nest bootstrap failed', err);
  process.exit(1);
});
