import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import type { GrantItemPayload } from './admin.type';
import { JwtAuthGuard } from '@/auth/guard/jwt.guard';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('grant-item')
  async grantItem(@Body() body: GrantItemPayload) {
    const { userId, itemId, quantity } = body;
    await this.adminService.grantItemToUser({
      userId,
      itemId,
      quantity,
    });
  }
}
