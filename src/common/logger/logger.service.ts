import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private apiErrorLogFilePath: string;
  private apiLogFilePath: string;
  private authErrorLogFilePath: string;
  private authLogFilePath: string;

  constructor(private readonly configService: ConfigService) {
    const apiLogDir = this.configService.get<string>('API_LOG_PATH') ?? 'logs';
    const authLogDir =
      this.configService.get<string>('AUTH_LOG_PATH') ?? 'logs';
    // 디렉토리 없으면 생성
    if (!fs.existsSync(apiLogDir)) {
      fs.mkdirSync(apiLogDir, { recursive: true });
    }
    // 디렉토리 없으면 생성
    if (!fs.existsSync(authLogDir)) {
      fs.mkdirSync(authLogDir, { recursive: true });
    }

    this.apiErrorLogFilePath = path.join(apiLogDir, 'api_error.log');
    this.apiLogFilePath = path.join(apiLogDir, 'api_action.log');
    this.authErrorLogFilePath = path.join(authLogDir, 'auth_Error.log');
    this.authLogFilePath = path.join(authLogDir, 'auth_action.log');
  }

  writeApiErrorLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.apiErrorLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }

  writeApiLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.apiLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }

  writeAuthErrorLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.authErrorLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }

  writeAuthLog(message: string) {
    // 파일에 append (비동기)
    fs.appendFile(this.authLogFilePath, message, (err) => {
      if (err) {
        console.error('로그 파일 쓰기 실패:', err);
      }
    });
  }
}
