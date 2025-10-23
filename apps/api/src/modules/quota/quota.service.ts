import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';

@Injectable()
export class QuotaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user quota information
   */
  async getUserQuota(userUuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user agent quotas
    const agentQuotas = await this.prisma.userAgentQuota.findMany({
      where: { userId: user.id },
      include: {
        quotaDefinition: true,
      },
    });

    // Get quota usage
    const quotaUsage = await this.prisma.quotaUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate total usage
    const totalUsage = quotaUsage.reduce(
      (sum, usage) => sum + (usage.usage || 0),
      0,
    );

    return {
      quotas: agentQuotas.map((quota) => ({
        uuid: quota.uuid,
        quotaDefinition: quota.quotaDefinition,
        currentUsage: quota.currentUsage,
        limit: quota.limit,
        resetDate: quota.resetDate,
        isUnlimited: quota.isUnlimited,
        remainingQuota: quota.isUnlimited
          ? null
          : Math.max(0, quota.limit - quota.currentUsage),
        usagePercentage: quota.isUnlimited
          ? 0
          : (quota.currentUsage / quota.limit) * 100,
      })),
      totalUsage,
      recentUsage: quotaUsage,
    };
  }

  /**
   * Get quota events history
   */
  async getQuotaEvents(userUuid: string, limit = 50) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.quotaEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        quotaDefinition: true,
      },
    });
  }

  /**
   * Check if user has available quota for a specific action
   */
  async checkQuotaAvailable(
    userUuid: string,
    quotaDefinitionId: bigint,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const quota = await this.prisma.userAgentQuota.findFirst({
      where: {
        userId: user.id,
        quotaDefinitionId,
      },
    });

    if (!quota) {
      return false;
    }

    if (quota.isUnlimited) {
      return true;
    }

    return quota.currentUsage < quota.limit;
  }
}
