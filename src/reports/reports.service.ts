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
    // Use raw SQL to handle COALESCE correctly in grouping
    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "entryDate",
        SUM(COALESCE("correctedQuantity", "actualQuantity")) as "actualQuantity",
        SUM("rejectionQuantity") as "rejectionQuantity",
        SUM("runningHours") as "runningHours",
        AVG("partsPerHour") as "partsPerHour"
      FROM "ProductionEntry"
      WHERE "entryDate" >= $1 AND "entryDate" <= $2
      GROUP BY "entryDate"
      ORDER BY "entryDate" ASC
    `, 
    query.startDate ? new Date(query.startDate) : new Date('2000-01-01'), 
    query.endDate ? new Date(query.endDate) : new Date('2100-01-01'));
  }

  async getShiftReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "shift",
        SUM(COALESCE("correctedQuantity", "actualQuantity")) as "actualQuantity",
        SUM("rejectionQuantity") as "rejectionQuantity",
        AVG("partsPerHour") as "partsPerHour"
      FROM "ProductionEntry"
      WHERE "entryDate" >= $1 AND "entryDate" <= $2
      GROUP BY "shift"
      ORDER BY "shift" ASC
    `,
    query.startDate ? new Date(query.startDate) : new Date('2000-01-01'), 
    query.endDate ? new Date(query.endDate) : new Date('2100-01-01'));
  }

  async getOperatorPerformanceReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "operatorId",
        SUM(COALESCE("correctedQuantity", "actualQuantity")) as "actualQuantity",
        SUM("rejectionQuantity") as "rejectionQuantity",
        SUM("runningHours") as "runningHours",
        AVG("partsPerHour") as "partsPerHour"
      FROM "ProductionEntry"
      WHERE "entryDate" >= $1 AND "entryDate" <= $2
      GROUP BY "operatorId"
      ORDER BY "actualQuantity" DESC
    `,
    query.startDate ? new Date(query.startDate) : new Date('2000-01-01'), 
    query.endDate ? new Date(query.endDate) : new Date('2100-01-01'));
  }

  async getMachinePerformanceReport(query: ReportQueryDto) {
    const where = this.buildWhere(query);
    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "machineId",
        SUM(COALESCE("correctedQuantity", "actualQuantity")) as "actualQuantity",
        SUM("rejectionQuantity") as "rejectionQuantity",
        SUM("runningHours") as "runningHours",
        AVG("partsPerHour") as "partsPerHour"
      FROM "ProductionEntry"
      WHERE "entryDate" >= $1 AND "entryDate" <= $2
      GROUP BY "machineId"
      ORDER BY "actualQuantity" DESC
    `,
    query.startDate ? new Date(query.startDate) : new Date('2000-01-01'), 
    query.endDate ? new Date(query.endDate) : new Date('2100-01-01'));
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
