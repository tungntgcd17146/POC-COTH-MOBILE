import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export type UserWithoutPassword = Omit<User, 'password' | 'refreshToken'>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  /**
   * Find user by UUID (public identifier)
   */
  async findByUuid(uuid: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        company: true,
        address: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.excludePassword(user);
  }

  /**
   * Find user by ID (internal use)
   */
  async findById(id: bigint): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create new user
   */
  async create(data: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyId?: bigint;
  }): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_SALT || '10'),
    );

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyId: data.companyId,
        roles: ['AppUser'],
        status: 'Pending',
      },
      include: {
        company: true,
      },
    });

    return this.excludePassword(user);
  }

  /**
   * Update user
   */
  async update(
    uuid: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { uuid },
      data,
      include: {
        company: true,
        address: true,
      },
    });

    return this.excludePassword(updated);
  }

  /**
   * Delete user (soft delete)
   */
  async delete(uuid: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { uuid },
      data: {
        deletedAt: new Date(),
        status: 'Deactivated',
      },
    });
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginTime: new Date() },
    });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(
    id: bigint,
    refreshToken: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Exclude sensitive fields from user object
   */
  private excludePassword(user: any): UserWithoutPassword {
    const { password, refreshToken, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
