import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth() {
    let databaseStatus = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      databaseStatus = 'down';
    }

    return {
      status: databaseStatus === 'up' ? 'healthy' : 'unhealthy',
      database: databaseStatus,
      timestamp: new Date(),
    };
  }
}
