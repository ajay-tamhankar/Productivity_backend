import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    const existingItem = await this.prisma.item.findUnique({
      where: { itemCode: createItemDto.itemCode },
    });

    if (existingItem) {
      throw new ConflictException('Item code already exists');
    }

    return this.prisma.item.create({ data: createItemDto });
  }

  findAll() {
    return this.prisma.item.findMany({ orderBy: { itemCode: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    await this.findOne(id);
    return this.prisma.item.update({ where: { id }, data: updateItemDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.item.delete({ where: { id } });
    return { message: 'Item deleted successfully' };
  }
}
