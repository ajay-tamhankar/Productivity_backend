import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { CreateProductionEntryDto } from './dto/create-production-entry.dto';
import { ProductionFeedQueryDto } from './dto/production-feed-query.dto';
import { UpdateProductionEntryDto } from './dto/update-production-entry.dto';
import { ProductionService } from './production.service';

@ApiTags('Production Entries')
@ApiBearerAuth()
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('entry')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Create production entry with server-side calculations' })
  create(
    @Body() createProductionEntryDto: CreateProductionEntryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.productionService.create(createProductionEntryDto, currentUser);
  }

  @Get('entries')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'List all production entries' })
  findAll() {
    return this.productionService.findAll();
  }

  @Get('entries/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get production entry by id' })
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Patch('entries/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update production entry' })
  update(
    @Param('id') id: string,
    @Body() updateProductionEntryDto: UpdateProductionEntryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.productionService.update(id, updateProductionEntryDto, currentUser);
  }

  @Delete('entries/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete production entry' })
  remove(@Param('id') id: string) {
    return this.productionService.remove(id);
  }

  @Get('operator-feed')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get recent operator entries feed' })
  getOperatorFeed(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: ProductionFeedQueryDto,
  ) {
    return this.productionService.getOperatorFeed(currentUser, query);
  }
}
