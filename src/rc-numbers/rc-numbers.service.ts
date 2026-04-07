import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateRcNumberDto } from './dto/create-rc-number.dto';
import { UpdateRcNumberDto } from './dto/update-rc-number.dto';

@Injectable()
export class RcNumbersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRcNumberDto) {
    const existing = await this.prisma.rcNumber.findUnique({
      where: { rcNumber: dto.rcNumber },
    });
    if (existing) {
      throw new BadRequestException(`RC number '${dto.rcNumber}' already exists`);
    }
    return this.prisma.rcNumber.create({
      data: {
        rcNumber: dto.rcNumber,
        description: dto.description,
      },
    });
  }

  findAll() {
    return this.prisma.rcNumber.findMany({
      orderBy: { rcNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.rcNumber.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('RC number not found');
    }
    return record;
  }

  async update(id: string, dto: UpdateRcNumberDto) {
    await this.findOne(id);
    if (dto.rcNumber) {
      const conflict = await this.prisma.rcNumber.findFirst({
        where: { rcNumber: dto.rcNumber, NOT: { id } },
      });
      if (conflict) {
        throw new BadRequestException(`RC number '${dto.rcNumber}' already exists`);
      }
    }
    return this.prisma.rcNumber.update({
      where: { id },
      data: {
        rcNumber: dto.rcNumber,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rcNumber.delete({ where: { id } });
    return { message: 'RC number deleted successfully' };
  }
}
