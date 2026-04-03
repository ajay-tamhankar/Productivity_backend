import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { ShiftProductionQueryDto } from './dto/shift-production-query.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get dashboard KPI metrics' })
  getKpis(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getKpis(query);
  }

  @Get('shift-production')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get shift-wise production chart data' })
  getShiftProduction(@Query() query: ShiftProductionQueryDto) {
    return this.dashboardService.getShiftProduction(query);
  }

  @Get('rejection-reasons')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get rejection reason distribution' })
  getRejectionReasons(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRejectionReasons(query);
  }

  @Get('operator-stats')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get production stats for the logged-in operator' })
  getOperatorStats(
    @Query() query: DashboardQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.dashboardService.getOperatorStats(query, currentUser.sub);
  }
}
