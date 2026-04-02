import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
    );

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        name: createUserDto.name,
        role: createUserDto.role,
        isActive: createUserDto.isActive ?? true,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...updateUserDto };

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
      );
      delete data.password;
    }

    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
