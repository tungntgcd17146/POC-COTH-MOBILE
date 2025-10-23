import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { QuotaInfo, QuotaEvent } from './entities/quota.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class QuotaResolver {
  constructor(private readonly quotaService: QuotaService) {}

  @Query(() => QuotaInfo, {
    name: 'userQuota',
    description: 'Get current user quota information',
  })
  @UseGuards(GqlAuthGuard)
  async getUserQuota(@CurrentUser() user: any): Promise<QuotaInfo> {
    return this.quotaService.getUserQuota(user.uuid);
  }

  @Query(() => [QuotaEvent], {
    name: 'quotaEvents',
    description: 'Get quota events history',
  })
  @UseGuards(GqlAuthGuard)
  async getQuotaEvents(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
  ): Promise<QuotaEvent[]> {
    return this.quotaService.getQuotaEvents(user.uuid, limit);
  }
}
