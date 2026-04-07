import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from 'src/customers/customers.service';
import { ItemsService } from 'src/items/items.service';
import { MachinesService } from 'src/machines/machines.service';


@ApiTags('Master Data')
@ApiBearerAuth()
@Controller('master-data')
export class MasterDataController {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly itemsService: ItemsService,
    private readonly customersService: CustomersService,
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


}
