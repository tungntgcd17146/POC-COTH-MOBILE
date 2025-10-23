import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string; // user uuid
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
    const user = await this.userService.create({
      email: registerDto.email,
      username: registerDto.username,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { uuid: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userUuid: string) {
    const user = await this.prisma.user.findUnique({ where: { uuid: userUuid } });
    if (user) {
      await this.userService.updateRefreshToken(user.id, null);
    }
  }

  /**
   * Validate user by UUID (used by JWT strategy)
   */
  async validateUser(uuid: string) {
    const user = await this.userService.findByUuid(uuid);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  /**
   * Google OAuth login/register
   */
  async googleLogin(profile: any) {
    const email = profile.emails[0].value;
    let user: any = await this.userService.findByEmail(email);

    if (!user) {
      // Register new user from Google profile
      const username =
        profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
        email.split('@')[0];

      user = await this.userService.create({
        email,
        username,
        password: Math.random().toString(36), // Random password for OAuth users
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
      });

      // Create auth provider entry
      await this.prisma.authProvider.create({
        data: {
          userId: user.id,
          provider: 'Google',
          providerId: profile.id,
          providerData: profile,
        },
      });
    } else {
      // Check if Google auth provider exists
      const authProvider = await this.prisma.authProvider.findFirst({
        where: {
          userId: user.id,
          provider: 'Google',
        },
      });

      if (!authProvider) {
        // Link Google account to existing user
        await this.prisma.authProvider.create({
          data: {
            userId: user.id,
            provider: 'Google',
            providerId: profile.id,
            providerData: profile,
          },
        });
      }
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.uuid,
      email: user.email,
      roles: user.roles || [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION',
          '24h',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION',
          '30d',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Update refresh token in database (hashed)
   */
  private async updateRefreshToken(
    userId: bigint,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hashedToken);
  }
}
