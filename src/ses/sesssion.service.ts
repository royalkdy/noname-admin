// src/common/mail/ses.service.ts
import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class SessionService {
  private client: SESClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.client = new SESClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  async mapUserSession(userId: number, sessionId: string) {
    const sessionTTL = this.configService.get<number>('SESSION_TTL')!;
    const key = `user:sessions:${userId}`;
    await this.redisService
      .getSessionClient()
      .set(key, sessionId, { EX: sessionTTL });
  }

  async delUserSession(userId: number) {
    const key = `user:sessions:${userId}`;
    await this.redisService.getSessionClient().del(key);
  }

  async sendEmail(to: string, subject: string, html: string) {
    const command = new SendEmailCommand({
      Source: this.configService.get<string>('SES_FROM_EMAIL')!,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
        },
      },
    });
    await this.client.send(command);
  }
}
