import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.uuid);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req: any, @Body() updateDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.uuid, updateDto);
  }

  @Post('welcome/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark welcome flow as completed' })
  @ApiResponse({ status: 200, description: 'Welcome completed' })
  async completeWelcome(@Request() req: any) {
    return this.profileService.completeWelcome(req.user.uuid);
  }

  @Post('additional-info/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark additional information collection as completed',
  })
  @ApiResponse({ status: 200, description: 'Additional info completed' })
  async completeAdditionalInfo(@Request() req: any) {
    return this.profileService.completeAdditionalInformation(req.user.uuid);
  }
}
