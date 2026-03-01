import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private errorLogFilePath: string;
  private debugLogFilePath: string;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.get<string>('API_LOG_PATH') ?? 'logs';
    // 디렉토리 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.errorLogFilePath = path.join(logDir, 'api_error.log');
    this.debugLogFilePath = path.join(logDir, 'userAction.log');
  }

  writeErrorLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.errorLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }

  writeActionLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.debugLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }
}

@Injectable()
export class AuthLoggerService {
  private logFilePath: string;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.get<string>('AUTH_LOG_PATH') ?? 'logs';
    // 디렉토리 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFilePath = path.join(logDir, 'auth_error.log');
  }
  writeErrorLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.logFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }
}
