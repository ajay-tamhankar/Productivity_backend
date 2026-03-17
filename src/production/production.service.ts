import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalStatus, Prisma, Role } from '@prisma/client';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { PrismaService } from 'src/database/prisma.service';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';
import { ProductionFeedQueryDto } from './dto/production-feed-query.dto';
import { UpdateProductionEntryDto } from './dto/update-production-entry.dto';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  private getComputedMetrics(input: {
    itemFinishWeight: number;
    startTime: string;
    endTime: string;
    actualQuantity: number;
  }) {
    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const runningHoursRaw = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (runningHoursRaw <= 0) {
      throw new BadRequestException('End time must be greater than start time');
    }

    return {
      runningHours: Number(runningHoursRaw.toFixed(2)),
      partsPerHour: Number((input.actualQuantity / runningHoursRaw).toFixed(2)),
      weightInKgs: Number(
        ((input.actualQuantity * input.itemFinishWeight) / 1000).toFixed(3),
      ),
    };
  }

  private async validateRelations(dto: CreateProductionEntryDto | UpdateProductionEntryDto) {
    const checks: Promise<unknown>[] = [];

    if (dto.operatorId) {
      checks.push(this.prisma.user.findUnique({ where: { id: dto.operatorId } }));
    }
    if (dto.machineId) {
      checks.push(this.prisma.machine.findUnique({ where: { id: dto.machineId } }));
    }
    if (dto.customerId) {
      checks.push(this.prisma.customer.findUnique({ where: { id: dto.customerId } }));
    }
    if (dto.itemId) {
      checks.push(this.prisma.item.findUnique({ where: { id: dto.itemId } }));
    }

    const results = await Promise.all(checks);
    if (results.some((value) => !value)) {
      throw new BadRequestException('One or more related records were not found');
    }
  }

  private ensureBusinessRules(actualQuantity: number, rejectionQuantity: number) {
    if (rejectionQuantity > actualQuantity) {
      throw new BadRequestException('Rejection quantity cannot exceed actual quantity');
    }
  }

  private async buildComputedData(input: {
    itemId: string;
    startTime: string;
    endTime: string;
    actualQuantity: number;
  }) {
    const item = await this.prisma.item.findUnique({ where: { id: input.itemId } });
    if (!item) {
      throw new BadRequestException('Item not found');
    }

    return this.getComputedMetrics({
      itemFinishWeight: Number(item.finishWeight),
      startTime: input.startTime,
      endTime: input.endTime,
      actualQuantity: input.actualQuantity,
    });
  }

  private includeRelations = {
    operator: { select: { id: true, name: true, username: true, role: true } },
    machine: true,
    customer: true,
    item: true,
    approvedBy: { select: { id: true, name: true, username: true, role: true } },
    rejectionLogs: true,
  } satisfies Prisma.ProductionEntryInclude;

  async create(createProductionEntryDto: CreateProductionEntryDto, currentUser: AuthenticatedUser) {
    await this.validateRelations(createProductionEntryDto);
    this.ensureBusinessRules(
      createProductionEntryDto.actualQuantity,
      createProductionEntryDto.rejectionQuantity,
    );

    const computed = await this.buildComputedData({
      itemId: createProductionEntryDto.itemId,
      startTime: createProductionEntryDto.startTime,
      endTime: createProductionEntryDto.endTime,
      actualQuantity: createProductionEntryDto.actualQuantity,
    });
    const approvalStatus =
      currentUser.role === Role.OPERATOR
        ? ApprovalStatus.PENDING
        : createProductionEntryDto.approvalStatus ?? ApprovalStatus.APPROVED;

    return this.prisma.productionEntry.create({
      data: {
        entryDate: new Date(createProductionEntryDto.entryDate),
        shift: createProductionEntryDto.shift,
        operatorId: createProductionEntryDto.operatorId,
        machineId: createProductionEntryDto.machineId,
        customerId: createProductionEntryDto.customerId,
        itemId: createProductionEntryDto.itemId,
        ccd1Quantity: createProductionEntryDto.ccd1Quantity,
        actualQuantity: createProductionEntryDto.actualQuantity,
        rejectionQuantity: createProductionEntryDto.rejectionQuantity,
        startTime: new Date(createProductionEntryDto.startTime),
        endTime: new Date(createProductionEntryDto.endTime),
        approvalStatus,
        approvedById:
          approvalStatus === ApprovalStatus.APPROVED ? currentUser.sub : undefined,
        notes: createProductionEntryDto.notes,
        ...computed,
        rejectionLogs: createProductionEntryDto.rejectionDetails?.length
          ? {
              create: createProductionEntryDto.rejectionDetails,
            }
          : undefined,
      },
      include: this.includeRelations,
    });
  }

  findAll() {
    return this.prisma.productionEntry.findMany({
      include: this.includeRelations,
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.productionEntry.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!entry) {
      throw new NotFoundException('Production entry not found');
    }

    return entry;
  }

  async update(id: string, updateProductionEntryDto: UpdateProductionEntryDto, currentUser: AuthenticatedUser) {
    const existingEntry = await this.findOne(id);
    await this.validateRelations(updateProductionEntryDto);

    const actualQuantity = updateProductionEntryDto.actualQuantity ?? existingEntry.actualQuantity;
    const rejectionQuantity =
      updateProductionEntryDto.rejectionQuantity ?? existingEntry.rejectionQuantity;
    this.ensureBusinessRules(actualQuantity, rejectionQuantity);

    const mergedInput = {
      itemId: updateProductionEntryDto.itemId ?? existingEntry.itemId,
      startTime: updateProductionEntryDto.startTime ?? existingEntry.startTime.toISOString(),
      endTime: updateProductionEntryDto.endTime ?? existingEntry.endTime.toISOString(),
      actualQuantity,
    };

    const computed = await this.buildComputedData(mergedInput);

    return this.prisma.productionEntry.update({
      where: { id },
      data: {
        entryDate: updateProductionEntryDto.entryDate
          ? new Date(updateProductionEntryDto.entryDate)
          : undefined,
        shift: updateProductionEntryDto.shift,
        operatorId: updateProductionEntryDto.operatorId,
        machineId: updateProductionEntryDto.machineId,
        customerId: updateProductionEntryDto.customerId,
        itemId: updateProductionEntryDto.itemId,
        ccd1Quantity: updateProductionEntryDto.ccd1Quantity,
        actualQuantity: updateProductionEntryDto.actualQuantity,
        rejectionQuantity: updateProductionEntryDto.rejectionQuantity,
        startTime: updateProductionEntryDto.startTime
          ? new Date(updateProductionEntryDto.startTime)
          : undefined,
        endTime: updateProductionEntryDto.endTime
          ? new Date(updateProductionEntryDto.endTime)
          : undefined,
        notes: updateProductionEntryDto.notes,
        approvalStatus: updateProductionEntryDto.approvalStatus,
        approvedById:
          updateProductionEntryDto.approvalStatus === ApprovalStatus.APPROVED
            ? currentUser.sub
            : updateProductionEntryDto.approvalStatus === ApprovalStatus.REJECTED
              ? null
              : undefined,
        ...computed,
        rejectionLogs: updateProductionEntryDto.rejectionDetails
          ? {
              deleteMany: {},
              create: updateProductionEntryDto.rejectionDetails,
            }
          : undefined,
      },
      include: this.includeRelations,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.productionEntry.delete({ where: { id } });
    return { message: 'Production entry deleted successfully' };
  }

  async getOperatorFeed(currentUser: AuthenticatedUser, query: ProductionFeedQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = currentUser.role === Role.OPERATOR ? { operatorId: currentUser.sub } : {};

    const [totalRecords, data] = await this.prisma.$transaction([
      this.prisma.productionEntry.count({ where }),
      this.prisma.productionEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
        include: {
          machine: true,
          item: true,
        },
      }),
    ]);

    return {
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data: data.map((entry) => ({
        id: entry.id,
        date: entry.entryDate,
        shift: entry.shift,
        machineName: entry.machine.name,
        itemDescription: entry.item.description,
        actualQuantity: entry.actualQuantity,
      })),
    };
  }
}
