import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateQuantityWithLogDto } from './dto/update-quantity-with-log.dto';
import { BrinSummaryQueryDto, DateRange } from './dto/brin-summary-query.dto';

@Injectable()
export class BrinService {
  constructor(private readonly prisma: PrismaService) {}

  async getRcSummary(query: BrinSummaryQueryDto) {
    let { startDate, endDate, range, rcNumber } = query;
    const params: any[] = [];

    if (range && range !== DateRange.ALL) {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      switch (range) {
        case DateRange.TODAY:
          startDate = todayStart.toISOString();
          endDate = todayEnd.toISOString();
          break;
        case DateRange.YESTERDAY:
          const yesterday = new Date(todayStart);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);
          startDate = yesterday.toISOString();
          endDate = yesterdayEnd.toISOString();
          break;
        case DateRange.THIS_WEEK:
          const monday = new Date(todayStart);
          const day = monday.getDay();
          const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          monday.setDate(diff);
          startDate = monday.toISOString();
          // endDate remains undefined (now)
          break;
        case DateRange.THIS_MONTH:
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate = firstDay.toISOString();
          // endDate remains undefined (now)
          break;
      }
    }

    let whereClause = 'WHERE e."rcNumber" IS NOT NULL';

    if (startDate) {
      params.push(new Date(startDate));
      whereClause += ` AND e."entryDate" >= $${params.length}`;
    }
    if (endDate) {
      params.push(new Date(endDate));
      whereClause += ` AND e."entryDate" <= $${params.length}`;
    }
    if (rcNumber) {
      params.push(rcNumber);
      whereClause += ` AND e."rcNumber" = $${params.length}`;
    }

    const sql = `
      SELECT 
        e."rcNumber",
        e."location",
        i."itemCode",
        SUM(e."actualQuantity")::INTEGER as "totalActualQuantity",
        SUM(COALESCE(e."correctedQuantity", 0))::INTEGER as "totalCorrectedQuantity"
      FROM "ProductionEntry" e
      LEFT JOIN "Item" i ON e."itemId" = i."id"
      ${whereClause}
      GROUP BY e."rcNumber", e."location", i."itemCode"
      ORDER BY MAX(e."createdAt") DESC
    `;

    return this.prisma.$queryRawUnsafe<any[]>(sql, ...params);
  }

  async findByRcNumber(rcNumber: string) {
    const entries = await this.prisma.productionEntry.findMany({
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

    return entries.map((entry) => ({
      ...entry,
      originalQuantity: entry.actualQuantity,
      actualQuantity: entry.correctedQuantity ?? entry.actualQuantity,
    }));
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
          oldValue: (entry.correctedQuantity || entry.actualQuantity).toString(),
          newValue: newQuantity.toString(),
          comment: updateDto.comment,
          editedById: userId,
        },
      });

      // Update entry
      return tx.productionEntry.update({
        where: { id: entryId },
        data: {
          correctedQuantity: newQuantity,
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
