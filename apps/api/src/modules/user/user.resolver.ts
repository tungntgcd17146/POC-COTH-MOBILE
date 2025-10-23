import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'me', description: 'Get current authenticated user' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return this.userService.findByUuid(user.uuid);
  }

  @Query(() => User, { name: 'user', description: 'Get user by UUID' })
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('uuid') uuid: string) {
    return this.userService.findByUuid(uuid);
  }

  @Mutation(() => Boolean, { name: 'deleteMe', description: 'Delete current user account' })
  @UseGuards(GqlAuthGuard)
  async deleteCurrentUser(@CurrentUser() user: any) {
    await this.userService.delete(user.uuid);
    return true;
  }
}
