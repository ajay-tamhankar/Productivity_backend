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
        weightInKgs: true,
      },
      _avg: {
        partsPerHour: true,
      },
    });

    // To calculate rejection weight correctly, we need the item's finish weight for each entry
    const entries = await this.prisma.productionEntry.findMany({
      where,
      select: {
        rejectionQuantity: true,
        item: { select: { finishWeight: true } },
      },
    });

    const totalRejectionWeight = entries.reduce((acc, entry) => {
      const weight = (entry.rejectionQuantity * Number(entry.item.finishWeight)) / 1000;
      return acc + weight;
    }, 0);

    const logs = await this.prisma.rejectionLog.findMany({
      where: {
        productionEntry: { is: where },
      },
      include: {
        productionEntry: {
          select: {
            item: { select: { finishWeight: true } },
          },
        },
      },
    });

    const reasonsMap = new Map<string, { count: number; weight: number }>();
    logs.forEach((log) => {
      const current = reasonsMap.get(log.reason) || { count: 0, weight: 0 };
      const weight = (log.quantity * Number(log.productionEntry.item.finishWeight)) / 1000;
      reasonsMap.set(log.reason, {
        count: current.count + log.quantity,
        weight: current.weight + weight,
      });
    });

    const rejectionReasons = Array.from(reasonsMap.entries())
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        weight: Number(data.weight.toFixed(3)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalProductionWeight = Number(aggregate._sum.weightInKgs ?? 0);
    const totalRunningHours = Number(aggregate._sum.runningHours ?? 0);

    return {
      totalProduction: aggregate._sum.actualQuantity ?? 0,
      totalProductionweight: Number(totalProductionWeight.toFixed(3)),
      totalRejection: aggregate._sum.rejectionQuantity ?? 0,
      totalRejectionweight: Number(totalRejectionWeight.toFixed(3)),
      totalRunningHours: totalRunningHours,
      totalRunningHoursweight: totalRunningHours > 0 
        ? Number((totalProductionWeight / totalRunningHours).toFixed(2)) 
        : 0,
      averagePartsPerHour: Number(aggregate._avg.partsPerHour ?? 0),
      rejectionReasons: rejectionReasons,
    };
  }
  
  async getOperatorPerformance(query: DashboardQueryDto) {
    const where = this.buildDateFilter(query.startDate, query.endDate);

    const grouped = await this.prisma.productionEntry.groupBy({
      by: ['operatorId'],
      where,
      _sum: { actualQuantity: true },
      orderBy: { _sum: { actualQuantity: 'desc' } },
      take: 10, // Top 10 operators
    });

    const operatorIds = grouped.map((item) => item.operatorId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: operatorIds } },
      select: { id: true, name: true },
    });

    return grouped.map((item) => ({
      name: users.find((u) => u.id === item.operatorId)?.name ?? 'Unknown',
      value: item._sum.actualQuantity ?? 0,
    }));
  }

  async getMachineOutput(query: DashboardQueryDto) {
    const where = this.buildDateFilter(query.startDate, query.endDate);

    const grouped = await this.prisma.productionEntry.groupBy({
      by: ['machineId'],
      where,
      _sum: { actualQuantity: true },
      orderBy: { _sum: { actualQuantity: 'desc' } },
    });

    const machineIds = grouped.map((item) => item.machineId);
    const machines = await this.prisma.machine.findMany({
      where: { id: { in: machineIds } },
      select: { id: true, machineNumber: true, name: true },
    });

    return grouped.map((item) => ({
      name: machines.find((m) => m.id === item.machineId)?.name ?? 'Unknown',
      machineNumber: machines.find((m) => m.id === item.machineId)?.machineNumber,
      value: item._sum.actualQuantity ?? 0,
    }));
  }
}
