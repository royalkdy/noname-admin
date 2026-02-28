import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import type { GrantItemPayload } from './admin.type';
import { JwtAuthGuard } from '@/auth/guard/jwt.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { AdminRole } from '@/common/enums/admin-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(AdminRole.SUPER)
  @Post('grant-item')
  async grantItem(@Body() body: GrantItemPayload) {
    const { userId, itemId, quantity } = body;
    await this.adminService.grantItemToUser({
      userId,
      itemId,
      quantity,
    });
  }

  @Roles(AdminRole.VIEWER)
  @Post('test-role')
  async testRole() {
    return 'ok';
  }
}
