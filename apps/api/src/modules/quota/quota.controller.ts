import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { QuotaService } from './quota.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('quota')
@Controller('quota')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  @ApiOperation({ summary: 'Get user quota information' })
  @ApiResponse({ status: 200, description: 'Quota information retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserQuota(@Request() req: any) {
    return this.quotaService.getUserQuota(req.user.uuid);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get quota events history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Quota events retrieved' })
  async getQuotaEvents(@Request() req: any, @Query('limit') limit?: number) {
    return this.quotaService.getQuotaEvents(
      req.user.uuid,
      limit ? parseInt(limit.toString()) : 50,
    );
  }
}
