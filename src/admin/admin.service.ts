import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { GrantItemPayload } from './admin.type';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async grantItemToUser(
    payload: GrantItemPayload,
  ): Promise<{ itemId: number; quantity: number }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id: payload.itemId },
      });

      if (!item) {
        throw new Error('ITEM_NOT_FOUND');
      }
      if (item.stackable) {
        const userItem = await tx.userItem.findFirst({
          where: {
            userId: payload.userId,
            itemId: payload.itemId,
          },
        });

        if (userItem) {
          const updated = await tx.userItem.update({
            where: { id: userItem.id },
            data: {
              quantity: { increment: payload.quantity },
            },
          });
          return {
            itemId: updated.itemId,
            quantity: updated.quantity,
          };
        }

        const created = await tx.userItem.create({
          data: {
            userId: payload.userId,
            itemId: payload.itemId,
            quantity: payload.quantity,
          },
        });

        return {
          itemId: created.itemId,
          quantity: created.quantity,
        };
      }

      // 비스택형
      for (let i = 0; i < payload.quantity; i++) {
        await tx.userItem.create({
          data: {
            userId: payload.userId,
            itemId: payload.itemId,
            quantity: 1,
          },
        });
      }

      return {
        itemId: payload.itemId,
        quantity: payload.quantity,
      };
    });
    return { itemId: result.itemId, quantity: result.quantity };
  }
}
