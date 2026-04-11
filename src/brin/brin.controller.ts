import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { BrinService } from './brin.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateQuantityWithLogDto } from './dto/update-quantity-with-log.dto';

@ApiTags('BRIN')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('brin')
export class BrinController {
  constructor(private readonly brinService: BrinService) {}

  @Get('rc/:rcNumber')
  @Roles(Role.BRIN, Role.ADMIN)
  @ApiOperation({ summary: 'Fetch production entries by RC number' })
  findByRcNumber(@Param('rcNumber') rcNumber: string) {
    return this.brinService.findByRcNumber(rcNumber);
  }

  @Patch('rc/:rcNumber/location')
  @Roles(Role.BRIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update location for all entries with the given RC number' })
  updateLocation(
    @Param('rcNumber') rcNumber: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.brinService.updateLocationByRc(rcNumber, dto.location, user.sub);
  }

  @Patch('entries/:id/quantity')
  @Roles(Role.BRIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update quantity for a specific production entry with logging' })
  updateQuantity(
    @Param('id') id: string,
    @Body() dto: UpdateQuantityWithLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.brinService.updateQuantity(id, dto, user.sub);
  }

  @Get('activity')
  @Roles(Role.BRIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get all activity logs for the BRIN dashboard' })
  getActivityLogs() {
    return this.brinService.getActivityLogs();
  }
}
