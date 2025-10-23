import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('activity')
@Controller('activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get user activity feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActivityFeed(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.activityService.getActivityFeed(
      req.user.uuid,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get recent agent conversations' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getRecentConversations(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.getRecentConversations(
      req.user.uuid,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get recent collection activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Collection activities retrieved' })
  async getCollectionActivities(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.getCollectionActivities(
      req.user.uuid,
      limit ? parseInt(limit.toString()) : 20,
    );
  }
}
