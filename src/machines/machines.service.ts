import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async findAll() {
    const machines = await this.prisma.machine.findMany({
      select: {
        id: true,
        machineNumber: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const MACHINE_ORDER = [
      'M-101',
      '932 - 1',
      '932 - 2',
      '937 - 3',
      '935 - 4',
      '936 - 5',
      '933 - 6',
      '1068 - 7',
      '1072 - 8',
      '1078 - 9',
      '1013 - 10',
      '1123 - 11',
      '1124 - 12',
      '1009 - 1',
      '1010 - 2',
      '1011 - 3',
    ];

    return machines.sort((a, b) => {
      let indexA = MACHINE_ORDER.indexOf(a.machineNumber);
      let indexB = MACHINE_ORDER.indexOf(b.machineNumber);

      // Machines not in the list go to the end
      if (indexA === -1) indexA = MACHINE_ORDER.length;
      if (indexB === -1) indexB = MACHINE_ORDER.length;

      if (indexA !== indexB) {
        return indexA - indexB;
      }
      // Failover to secondary sort by number
      return a.machineNumber.localeCompare(b.machineNumber);
    });
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
    try {
      await this.prisma.machine.delete({ where: { id } });
      return { message: 'Machine deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete machine because it has associated production entries or other records.',
          );
        }
      }
      throw error;
    }
  }
}
