import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ErrorCode } from './common/error-code';

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

  // local용
  app.setGlobalPrefix('api/admin');
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
