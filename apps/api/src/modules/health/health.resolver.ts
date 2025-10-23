import { Resolver, Query } from '@nestjs/graphql';
import { HealthService } from './health.service';
import { HealthStatus } from './entities/health-status.entity';

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => HealthStatus, {
    name: 'health',
    description: 'Get API health status',
  })
  async getHealth(): Promise<HealthStatus> {
    return this.healthService.checkHealth();
  }
}
