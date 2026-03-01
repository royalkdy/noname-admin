import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from '@/common/logger/logger.service';
import { GlobalExceptionFilter } from '@/common/exception/api-exception.filter';
import { ApiResponseInterceptor } from './interceptors/api-success.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class CommonModule {}
