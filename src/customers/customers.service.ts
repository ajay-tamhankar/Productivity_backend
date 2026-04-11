import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { customerName: createCustomerDto.customerName },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer already exists');
    }

    return this.prisma.customer.create({ data: createCustomerDto });
  }

  findAll() {
    return this.prisma.customer.findMany({ orderBy: { customerName: 'asc' } });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: updateCustomerDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.customer.delete({ where: { id } });
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete customer because it has associated production entries or other records.',
          );
        }
      }
      throw error;
    }
  }
}
