import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateRcNumberDto } from './dto/create-rc-number.dto';
import { UpdateRcNumberDto } from './dto/update-rc-number.dto';
import { RcNumbersService } from './rc-numbers.service';

@ApiTags('RC Numbers')
@ApiBearerAuth()
@Controller('rc-numbers')
export class RcNumbersController {
  constructor(private readonly rcNumbersService: RcNumbersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create RC number (Admin only)' })
  create(@Body() dto: CreateRcNumberDto) {
    return this.rcNumbersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all RC numbers' })
  findAll() {
    return this.rcNumbersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RC number by id' })
  findOne(@Param('id') id: string) {
    return this.rcNumbersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update RC number (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateRcNumberDto) {
    return this.rcNumbersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete RC number (Admin only)' })
  remove(@Param('id') id: string) {
    return this.rcNumbersService.remove(id);
  }
}
