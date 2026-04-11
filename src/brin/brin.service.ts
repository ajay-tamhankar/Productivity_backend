import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateQuantityWithLogDto } from './dto/update-quantity-with-log.dto';

@Injectable()
export class BrinService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRcNumber(rcNumber: string) {
    return this.prisma.productionEntry.findMany({
      where: { rcNumber },
      include: {
        operator: { select: { id: true, name: true, role: true } },
        machine: true,
        item: true,
        brinActivities: {
          include: {
            editedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateLocationByRc(rcNumber: string, location: string, userId: string) {
    const entries = await this.prisma.productionEntry.findMany({
      where: { rcNumber },
    });

    if (entries.length === 0) {
      throw new NotFoundException(`No production entries found for RC number: ${rcNumber}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Create activity logs for each entry
      for (const entry of entries) {
        await tx.brinActivity.create({
          data: {
            productionEntryId: entry.id,
            activityType: 'LOCATION_UPDATE',
            oldValue: entry.location || 'N/A',
            newValue: location,
            comment: 'Location updated',
            editedById: userId,
          },
        });
      }

      // Perform batch update
      return tx.productionEntry.updateMany({
        where: { rcNumber },
        data: { location },
      });
    });
  }

  async updateQuantity(entryId: string, updateDto: UpdateQuantityWithLogDto, userId: string) {
    const entry = await this.prisma.productionEntry.findUnique({
      where: { id: entryId },
      include: { item: true },
    });

    if (!entry) {
      throw new NotFoundException('Production entry not found');
    }

    const previousQuantity = entry.actualQuantity;
    const newQuantity = updateDto.quantity;

    // Recalculate metrics
    const itemFinishWeight = Number(entry.item.finishWeight);
    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);
    const runningHoursRaw = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (runningHoursRaw <= 0) {
      throw new BadRequestException('Invalid entry times: End time must be after start time');
    }

    const partsPerHour = Number((newQuantity / runningHoursRaw).toFixed(2));
    const weightInKgs = Number(((newQuantity * itemFinishWeight) / 1000).toFixed(3));

    return this.prisma.$transaction(async (tx) => {
      // Create activity log
      await tx.brinActivity.create({
        data: {
          productionEntryId: entryId,
          activityType: 'QUANTITY_UPDATE',
          oldValue: previousQuantity.toString(),
          newValue: newQuantity.toString(),
          comment: updateDto.comment,
          editedById: userId,
        },
      });

      // Update entry
      return tx.productionEntry.update({
        where: { id: entryId },
        data: {
          actualQuantity: newQuantity,
          partsPerHour,
          weightInKgs,
        },
        include: {
          brinActivities: true,
        },
      });
    });
  }

  async getActivityLogs() {
    return this.prisma.brinActivity.findMany({
      include: {
        editedBy: { select: { id: true, name: true } },
        productionEntry: {
          include: {
            machine: true,
            item: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 for performance
    });
  }
}
