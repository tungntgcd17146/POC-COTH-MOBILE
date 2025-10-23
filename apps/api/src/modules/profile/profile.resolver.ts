import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserProfile } from './entities/user-profile.entity';
import { User } from '../user/entities/user.entity';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => UserProfile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => UserProfile, {
    name: 'profile',
    description: 'Get current user extended profile',
  })
  @UseGuards(GqlAuthGuard)
  async getProfile(@CurrentUser() user: any): Promise<UserProfile> {
    return this.profileService.getProfile(user.uuid);
  }

  @Mutation(() => User, {
    name: 'updateProfile',
    description: 'Update user profile information',
  })
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.profileService.updateProfile(user.uuid, input);
  }

  @Mutation(() => User, {
    name: 'completeWelcome',
    description: 'Mark welcome flow as completed',
  })
  @UseGuards(GqlAuthGuard)
  async completeWelcome(@CurrentUser() user: any): Promise<User> {
    return this.profileService.completeWelcome(user.uuid);
  }

  @Mutation(() => User, {
    name: 'completeAdditionalInfo',
    description: 'Mark additional information flow as completed',
  })
  @UseGuards(GqlAuthGuard)
  async completeAdditionalInfo(@CurrentUser() user: any): Promise<User> {
    return this.profileService.completeAdditionalInformation(user.uuid);
  }
}
