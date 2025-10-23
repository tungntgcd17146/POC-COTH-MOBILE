import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const logLevels = configService
      .get<string>('PRISMA_LOG_LEVELS', 'error,warn')
      .split(',') as Prisma.LogLevel[];

    super({
      log: logLevels.map((level) => ({
        level: level as Prisma.LogLevel,
        emit: 'event',
      })),
    });

    // Log queries in development
    if (configService.get('NODE_ENV') === 'development') {
      this.$on('query', (e: Prisma.QueryEvent) => {
        console.log('Query: ' + e.query);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }

    this.$on('error', (e: Prisma.LogEvent) => {
      console.error('Prisma Error:', e.message);
    });

    this.$on('warn', (e: Prisma.LogEvent) => {
      console.warn('Prisma Warning:', e.message);
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Prisma disconnected from database');
  }

  /**
   * Clean database for testing purposes
   */
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') !== 'test') {
      throw new Error('cleanDatabase can only be used in test environment');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key[0] !== '$',
    );

    await Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof typeof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      }),
    );
  }
}
