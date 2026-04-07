import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from 'src/customers/customers.service';
import { ItemsService } from 'src/items/items.service';
import { MachineNumbersService } from 'src/machine-numbers/machine-numbers.service';
import { MachinesService } from 'src/machines/machines.service';
import { RcNumbersService } from 'src/rc-numbers/rc-numbers.service';

@ApiTags('Master Data')
@ApiBearerAuth()
@Controller('master-data')
export class MasterDataController {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly itemsService: ItemsService,
    private readonly customersService: CustomersService,
    private readonly machineNumbersService: MachineNumbersService,
    private readonly rcNumbersService: RcNumbersService,
  ) {}

  @Get('machines')
  @ApiOperation({ summary: 'Get machine dropdown data' })
  getMachines() {
    return this.machinesService.findAll();
  }

  @Get('items')
  @ApiOperation({ summary: 'Get item dropdown data' })
  getItems() {
    return this.itemsService.findAll();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer dropdown data' })
  getCustomers() {
    return this.customersService.findAll();
  }

  @Get('machine-numbers')
  @ApiOperation({ summary: 'Get machine number dropdown data' })
  getMachineNumbers() {
    return this.machineNumbersService.findAll();
  }

  @Get('rc-numbers')
  @ApiOperation({ summary: 'Get RC number dropdown data' })
  getRcNumbers() {
    return this.rcNumbersService.findAll();
  }
}

