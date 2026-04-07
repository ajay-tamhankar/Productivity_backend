import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: ReportQueryDto): Prisma.ProductionEntryWhereInput {
    return {
      entryDate:
        query.startDate || query.endDate
          ? {
              gte: query.startDate ? new Date(query.startDate) : undefined,
              lte: query.endDate ? new Date(query.endDate) : undefined,
            }
          : undefined,
      machineId: query.machineId,
      shift: query.shift,
      operatorId: query.operatorId,
    };
  }

  async getDetailedReport(query: ReportQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query);

    const [totalRecords, data] = await this.prisma.$transaction([
      this.prisma.productionEntry.count({ where }),
      this.prisma.productionEntry.findMany({
        where,
        include: {
          operator: { select: { id: true, name: true, username: true } },
          machine: true,
          item: true,
          rejectionLogs: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data,
    };
  }

  async getDailyReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.productionEntry.groupBy({
      by: ['entryDate'],
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
        runningHours: true,
      },
      _avg: { partsPerHour: true },
      orderBy: { entryDate: 'asc' },
    });
  }

  async getShiftReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.productionEntry.groupBy({
      by: ['shift'],
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
      },
      _avg: { partsPerHour: true },
      orderBy: { shift: 'asc' },
    });
  }

  async getOperatorPerformanceReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.productionEntry.groupBy({
      by: ['operatorId'],
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
        runningHours: true,
      },
      _avg: { partsPerHour: true },
      orderBy: { _sum: { actualQuantity: 'desc' } },
    });
  }

  async getMachinePerformanceReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.productionEntry.groupBy({
      by: ['machineId'],
      where,
      _sum: {
        actualQuantity: true,
        rejectionQuantity: true,
        runningHours: true,
      },
      _avg: { partsPerHour: true },
      orderBy: { _sum: { actualQuantity: 'desc' } },
    });
  }

  async getRejectionAnalysisReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.rejectionLog.groupBy({
      by: ['reason'],
      where: { productionEntry: { is: where } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    });
  }
}
