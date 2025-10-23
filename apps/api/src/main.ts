import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const apiPort = configService.get<number>('API_PORT', 3006);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const enableSwagger = configService.get<boolean>('ENABLE_SWAGGER', true);

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API documentation
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('COTH Mobile API')
      .setDescription('REST API for COTH Mobile Application')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('profile', 'User profile endpoints')
      .addTag('quota', 'User quota endpoints')
      .addTag('activity', 'User activity feed endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  // Enable shutdown hooks
  app.enableShutdownHooks();

  await app.listen(apiPort);

  console.log(`🚀 COTH Mobile API is running on: http://localhost:${apiPort}/${apiPrefix}`);
  if (enableSwagger) {
    console.log(`📚 API Documentation: http://localhost:${apiPort}/${apiPrefix}/docs`);
  }
}

bootstrap();
