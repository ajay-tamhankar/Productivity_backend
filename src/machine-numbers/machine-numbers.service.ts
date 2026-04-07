import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateMachineNumberDto } from './dto/create-machine-number.dto';
import { UpdateMachineNumberDto } from './dto/update-machine-number.dto';

@Injectable()
export class MachineNumbersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMachineNumberDto) {
    const existing = await this.prisma.machineNumber.findUnique({
      where: { value: dto.value },
    });
    if (existing) {
      throw new BadRequestException(`Machine number '${dto.value}' already exists`);
    }
    return this.prisma.machineNumber.create({ data: { value: dto.value } });
  }

  findAll() {
    return this.prisma.machineNumber.findMany({
      orderBy: { value: 'asc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.machineNumber.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Machine number not found');
    }
    return record;
  }

  async update(id: string, dto: UpdateMachineNumberDto) {
    await this.findOne(id);
    if (dto.value) {
      const conflict = await this.prisma.machineNumber.findFirst({
        where: { value: dto.value, NOT: { id } },
      });
      if (conflict) {
        throw new BadRequestException(`Machine number '${dto.value}' already exists`);
      }
    }
    return this.prisma.machineNumber.update({ where: { id }, data: { value: dto.value } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.machineNumber.delete({ where: { id } });
    return { message: 'Machine number deleted successfully' };
  }
}
