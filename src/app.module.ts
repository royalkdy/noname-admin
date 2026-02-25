import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';

import { UserModule } from './user/user.module';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SessionModule } from './ses/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `${process.cwd()}/envs/.env.${process.env.NODE_ENV}`,
    }),
    PrismaModule,
    RedisModule,
    CommonModule,
    UserModule,
    AuthModule,
    SessionModule,
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService],
})
export class AppModule {}
