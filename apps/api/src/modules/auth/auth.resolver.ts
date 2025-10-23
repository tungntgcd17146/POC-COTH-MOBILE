import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, TokenResponse } from './entities/auth-response.entity';
import { User } from '../user/entities/user.entity';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, {
    name: 'register',
    description: 'Register a new user account',
  })
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse, {
    name: 'login',
    description: 'Login with email and password',
  })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Mutation(() => TokenResponse, {
    name: 'refreshToken',
    description: 'Refresh access token using refresh token',
  })
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<TokenResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Mutation(() => Boolean, {
    name: 'logout',
    description: 'Logout current user',
  })
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: any): Promise<boolean> {
    await this.authService.logout(user.uuid);
    return true;
  }

  @Query(() => User, {
    name: 'me',
    description: 'Get current authenticated user',
  })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any): Promise<User> {
    return this.authService.validateUser(user.uuid);
  }
}
