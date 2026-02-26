import {
  Controller,
  UseFilters,
  Body,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthExceptionFilter } from '@/common/exception/auth-exception.filter';
import { LocalSignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ErrorCode } from '@/common/error-code';

@UseFilters(AuthExceptionFilter)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async localSignUp(@Body() dto: LocalSignUpDto) {
    const user = await this.authService.signUpLocal(
      dto.email,
      dto.password,
      dto.name,
    );
    console.log(user.id, user.email);

    return user;
  }

  @Post('jwtLogin')
  async localLogin(
    @Req() req: Request,
    @Body() body: { email: string; password: string },
  ) {
    const admin = await this.authService.validateLocal(
      body.email,
      body.password,
    );
    if (!admin) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    const accessToken = await this.authService.issueAccessToken(admin.id);

    return accessToken;
  }
}
