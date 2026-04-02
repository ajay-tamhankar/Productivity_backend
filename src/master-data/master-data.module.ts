import { Module } from '@nestjs/common';
import { CustomersModule } from 'src/customers/customers.module';
import { ItemsModule } from 'src/items/items.module';
import { MachinesModule } from 'src/machines/machines.module';
import { MasterDataController } from './master-data.controller';

@Module({
  imports: [MachinesModule, ItemsModule, CustomersModule],
  controllers: [MasterDataController],
})
export class MasterDataModule {}
