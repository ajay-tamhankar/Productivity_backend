import { Module } from '@nestjs/common';
import { CustomersModule } from 'src/customers/customers.module';
import { ItemsModule } from 'src/items/items.module';
import { MachinesModule } from 'src/machines/machines.module';
import { RcNumbersModule } from 'src/rc-numbers/rc-numbers.module';
import { MasterDataController } from './master-data.controller';

@Module({
  imports: [MachinesModule, ItemsModule, CustomersModule, RcNumbersModule],
  controllers: [MasterDataController],
})
export class MasterDataModule {}
