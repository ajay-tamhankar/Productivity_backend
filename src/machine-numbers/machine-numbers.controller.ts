import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateMachineNumberDto } from './dto/create-machine-number.dto';
import { UpdateMachineNumberDto } from './dto/update-machine-number.dto';
import { MachineNumbersService } from './machine-numbers.service';

@ApiTags('Machine Numbers')
@ApiBearerAuth()
@Controller('machine-numbers')
export class MachineNumbersController {
  constructor(private readonly machineNumbersService: MachineNumbersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create machine number (Admin only)' })
  create(@Body() dto: CreateMachineNumberDto) {
    return this.machineNumbersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all machine numbers' })
  findAll() {
    return this.machineNumbersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine number by id' })
  findOne(@Param('id') id: string) {
    return this.machineNumbersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update machine number (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateMachineNumberDto) {
    return this.machineNumbersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete machine number (Admin only)' })
  remove(@Param('id') id: string) {
    return this.machineNumbersService.remove(id);
  }
}
