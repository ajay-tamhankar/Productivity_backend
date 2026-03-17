import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMachineDto: CreateMachineDto) {
    const existingMachine = await this.prisma.machine.findUnique({
      where: { machineNumber: createMachineDto.machineNumber },
    });

    if (existingMachine) {
      throw new ConflictException('Machine number already exists');
    }

    return this.prisma.machine.create({ data: createMachineDto });
  }

  findAll() {
    return this.prisma.machine.findMany({ orderBy: { machineNumber: 'asc' } });
  }

  async findOne(id: string) {
    const machine = await this.prisma.machine.findUnique({ where: { id } });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
    return machine;
  }

  async update(id: string, updateMachineDto: UpdateMachineDto) {
    await this.findOne(id);
    return this.prisma.machine.update({ where: { id }, data: updateMachineDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.machine.delete({ where: { id } });
    return { message: 'Machine deleted successfully' };
  }
}
