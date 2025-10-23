import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';

export interface ActivityFeedItem {
  id: string;
  type: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: any;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
}

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user activity feed
   * Combines various user activities from different sources
   */
  async getActivityFeed(
    userUuid: string,
    limit = 50,
    offset = 0,
  ): Promise<ActivityFeedItem[]> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activities: ActivityFeedItem[] = [];

    // Get audit logs
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    activities.push(
      ...auditLogs.map((log) => ({
        id: log.uuid,
        type: 'audit',
        action: log.action,
        description: `${log.action} on ${log.resource}`,
        timestamp: log.createdAt,
        metadata: log.metadata,
        relatedEntity: {
          type: log.resource,
          id: log.resourceId || '',
        },
      })),
    );

    // Get agent conversations
    const conversations = await this.prisma.agentUserConversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        agent: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });

    activities.push(
      ...conversations.map((conv) => ({
        id: conv.uuid,
        type: 'conversation',
        action: 'started_conversation',
        description: `Started conversation with ${conv.agent.name}`,
        timestamp: conv.createdAt,
        relatedEntity: {
          type: 'Agent',
          id: conv.agent.uuid,
          name: conv.agent.name,
        },
      })),
    );

    // Get collection entries created by user
    const collectionEntries = await this.prisma.collectionEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        collectionDefinition: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });

    activities.push(
      ...collectionEntries.map((entry) => ({
        id: entry.uuid,
        type: 'collection_entry',
        action: 'created_entry',
        description: `Created entry in ${entry.collectionDefinition.name}`,
        timestamp: entry.createdAt,
        relatedEntity: {
          type: 'CollectionDefinition',
          id: entry.collectionDefinition.uuid,
          name: entry.collectionDefinition.name,
        },
      })),
    );

    // Sort all activities by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, limit);
  }

  /**
   * Get recent agent conversations
   */
  async getRecentConversations(userUuid: string, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.agentUserConversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        agent: {
          select: {
            uuid: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            agentUserMessages: true,
          },
        },
      },
    });
  }

  /**
   * Get user's recent collection activities
   */
  async getCollectionActivities(userUuid: string, limit = 20) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.collectionEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        collectionDefinition: {
          select: {
            uuid: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}
