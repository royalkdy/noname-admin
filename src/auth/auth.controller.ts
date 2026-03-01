import {
  Controller,
  UseFilters,
  Body,
  Post,
  Req,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthExceptionFilter } from '@/common/exception/auth-exception.filter';
import { LocalSignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ErrorCode } from '@/common/error-code';
import { toDomainAdminRole } from '@/common/prisma/prisma-admin-role.mapper';
import { AuthResponseInterceptor } from '@/common/interceptors/auth-success.interceptor';
import { SkipApiLog } from '@/common/decorators/skip-api-log.decorator';

@SkipApiLog()
@UseFilters(AuthExceptionFilter)
@UseInterceptors(AuthResponseInterceptor)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(@Body() dto: LocalSignUpDto) {
    const user = await this.authService.createAdmin(
      dto.email,
      dto.password,
      dto.name,
    );

    return user;
  }

  // JWT 로그인
  @Post('login')
  async login(
    @Req() req: Request,
    @Body() body: { email: string; password: string },
  ) {
    const admin = await this.authService.validate(body.email, body.password);
    if (!admin) {
      throw new BadRequestException(ErrorCode.ADMIN_USER_NOT_FOUND);
    }

    const accessToken = await this.authService.issueAccessToken(
      admin.id,
      toDomainAdminRole(admin.role),
    );

    return accessToken;
  }
}
