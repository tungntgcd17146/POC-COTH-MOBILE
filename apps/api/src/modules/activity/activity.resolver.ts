import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import {
  ActivityFeedResponse,
  Conversation,
  CollectionActivity,
} from './entities/activity.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Query(() => ActivityFeedResponse, {
    name: 'activityFeed',
    description: 'Get user activity feed',
  })
  @UseGuards(GqlAuthGuard)
  async getActivityFeed(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 })
    offset: number,
  ): Promise<ActivityFeedResponse> {
    const items = await this.activityService.getActivityFeed(
      user.uuid,
      limit,
      offset,
    );
    return {
      items,
      total: items.length,
    };
  }

  @Query(() => [Conversation], {
    name: 'recentConversations',
    description: 'Get recent agent conversations',
  })
  @UseGuards(GqlAuthGuard)
  async getRecentConversations(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ): Promise<Conversation[]> {
    const conversations = await this.activityService.getRecentConversations(
      user.uuid,
      limit,
    );

    return conversations.map((conv) => ({
      uuid: conv.uuid,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      agent: {
        uuid: conv.agent.uuid,
        name: conv.agent.name,
        description: conv.agent.description,
      },
      messageCount: (conv._count as any).agentUserMessages || 0,
    }));
  }

  @Query(() => [CollectionActivity], {
    name: 'collectionActivities',
    description: "Get user's collection activities",
  })
  @UseGuards(GqlAuthGuard)
  async getCollectionActivities(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
  ): Promise<CollectionActivity[]> {
    const entries = await this.activityService.getCollectionActivities(
      user.uuid,
      limit,
    );

    return entries.map((entry) => ({
      uuid: entry.uuid,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      collectionDefinition: {
        uuid: entry.collectionDefinition.uuid,
        name: entry.collectionDefinition.name,
        slug: entry.collectionDefinition.slug,
      },
    }));
  }
}
