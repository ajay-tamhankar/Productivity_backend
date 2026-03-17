import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { ShiftProductionQueryDto } from './dto/shift-production-query.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles(Role.ADMIN, Role.SUPERVISOR)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  @ApiOperation({ summary: 'Get dashboard KPI metrics' })
  getKpis(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getKpis(query);
  }

  @Get('shift-production')
  @ApiOperation({ summary: 'Get shift-wise production chart data' })
  getShiftProduction(@Query() query: ShiftProductionQueryDto) {
    return this.dashboardService.getShiftProduction(query);
  }

  @Get('rejection-reasons')
  @ApiOperation({ summary: 'Get rejection reason distribution' })
  getRejectionReasons(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRejectionReasons(query);
  }
}
