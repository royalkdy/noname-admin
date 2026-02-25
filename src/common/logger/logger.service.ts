import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private errorLogFilePath: string;
  private debugLogFilePath: string;

  constructor(private readonly configService: ConfigService) {
    const logDir = this.configService.get<string>('SERVER_LOG_PATH') ?? 'logs';
    // 디렉토리 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.errorLogFilePath = path.join(logDir, 'error.log');
    this.debugLogFilePath = path.join(logDir, 'userAction.log');
  }
  error(message: string) {
    const errorLog = '[ERROR] ' + message + '\n';
    console.log('errorLog:' + errorLog);
    // 파일에 append (비동기)
    fs.appendFile(this.errorLogFilePath, errorLog, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }

  userActionLog(message: string) {
    const userActionLog = '[USER_ACTION] ' + message + '\n';
    console.log('DebugLog:' + userActionLog);
    // 파일에 append (비동기)
    fs.appendFile(this.debugLogFilePath, userActionLog, (err) => {
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
    const logDir =
      this.configService.get<string>('AUTH_SERVER_LOG_PATH') ?? 'logs';
    // 디렉토리 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFilePath = path.join(logDir, 'auth_error.log');
  }
  error(message: string) {
    const errorLog = '[ERROR]' + message + '\n';
    console.log('auth_error:' + errorLog);
    // 파일에 append (비동기)
    fs.appendFile(this.logFilePath, errorLog, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }
}
