import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@Roles(Role.ADMIN, Role.SUPERVISOR)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('detailed')
  @ApiOperation({ summary: 'Get paginated detailed production report' })
  getDetailedReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getDetailedReport(query);
  }

  @Get('daily-production')
  @ApiOperation({ summary: 'Get daily production report summary' })
  getDailyReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getDailyReport(query);
  }

  @Get('shift-wise')
  @ApiOperation({ summary: 'Get shift-wise production report summary' })
  getShiftReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getShiftReport(query);
  }

  @Get('operator-performance')
  @ApiOperation({ summary: 'Get operator performance report' })
  getOperatorPerformanceReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getOperatorPerformanceReport(query);
  }

  @Get('machine-performance')
  @ApiOperation({ summary: 'Get machine performance report' })
  getMachinePerformanceReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getMachinePerformanceReport(query);
  }

  @Get('rejection-analysis')
  @ApiOperation({ summary: 'Get rejection analysis report' })
  getRejectionAnalysisReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getRejectionAnalysisReport(query);
  }
}
