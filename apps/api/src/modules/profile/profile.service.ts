import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  /**
   * Get user profile with extended information
   */
  async getProfile(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        lastLoginTime: true,
        completedWelcome: true,
        completedAdditionalInformation: true,
        metadata: true,
        company: {
          select: {
            uuid: true,
            name: true,
          },
        },
        address: {
          select: {
            street1: true,
            street2: true,
            city: true,
            state: true,
            postalCode: true,
            country: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(uuid: string, updateDto: UpdateProfileDto) {
    const user = await this.userService.findByUuid(uuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userService.update(uuid, {
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      phone: updateDto.phone,
      metadata: updateDto.metadata,
    });
  }

  /**
   * Mark welcome as completed
   */
  async completeWelcome(uuid: string) {
    return this.userService.update(uuid, {
      completedWelcome: true,
    });
  }

  /**
   * Mark additional information as completed
   */
  async completeAdditionalInformation(uuid: string) {
    return this.userService.update(uuid, {
      completedAdditionalInformation: true,
    });
  }
}
