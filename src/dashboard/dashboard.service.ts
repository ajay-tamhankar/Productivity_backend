import { Injectable } from '@nestjs/common';
import { Shift } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { ShiftProductionQueryDto } from './dto/shift-production-query.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      return {};
    }

    return {
      entryDate: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    };
  }

  async getKpis(query: DashboardQueryDto) {
    const where = this.buildDateFilter(query.startDate, query.endDate);

    const aggregate = await this.prisma.productionEntry.aggregate({
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
        runningHours: true,
      },
      _avg: {
        partsPerHour: true,
      },
    });

    return {
      totalProduction: aggregate._sum.actualQuantity ?? 0,
      totalRejection: aggregate._sum.rejectionQuantity ?? 0,
      totalRunningHours: Number(aggregate._sum.runningHours ?? 0),
      averagePartsPerHour: Number(aggregate._avg.partsPerHour ?? 0),
    };
  }

  async getShiftProduction(query: ShiftProductionQueryDto) {
    const targetDate = query.date 
      ? new Date(query.date) 
      : new Date(new Date().toISOString().split('T')[0]);
    const grouped = await this.prisma.productionEntry.groupBy({
      by: ['shift'],
      where: { entryDate: targetDate },
      _sum: { actualQuantity: true },
    });

    return [Shift.A, Shift.B, Shift.C].map((shift) => ({
      shift,
      totalQuantity:
        grouped.find((item) => item.shift === shift)?._sum.actualQuantity ?? 0,
    }));
  }

  async getRejectionReasons(query: DashboardQueryDto) {
    const where = this.buildDateFilter(query.startDate, query.endDate);

    const grouped = await this.prisma.rejectionLog.groupBy({
      by: ['reason'],
      where: {
        productionEntry: { is: { ...where } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    });

    return grouped.map((item) => ({
      reason: item.reason,
      count: item._sum.quantity ?? 0,
    }));
  }

  async getOperatorStats(query: DashboardQueryDto, userId: string) {
    const dateFilter = this.buildDateFilter(query.startDate, query.endDate);
    const where = {
      ...dateFilter,
      operatorId: userId,
    };

    const aggregate = await this.prisma.productionEntry.aggregate({
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
        runningHours: true,
      },
      _avg: {
        partsPerHour: true,
      },
    });

    const rejectionReasons = await this.prisma.rejectionLog.groupBy({
      by: ['reason'],
      where: {
        productionEntry: { is: where },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return {
      totalProduction: aggregate._sum.actualQuantity ?? 0,
      totalRejection: aggregate._sum.rejectionQuantity ?? 0,
      totalRunningHours: Number(aggregate._sum.runningHours ?? 0),
      averagePartsPerHour: Number(aggregate._avg.partsPerHour ?? 0),
      rejectionReasons: rejectionReasons.map((item) => ({
        reason: item.reason,
        count: item._sum.quantity ?? 0,
      })),
    };
  }
}
