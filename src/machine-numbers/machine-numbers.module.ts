import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MachineNumbersController } from './machine-numbers.controller';
import { MachineNumbersService } from './machine-numbers.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MachineNumbersController],
  providers: [MachineNumbersService],
  exports: [MachineNumbersService],
})
export class MachineNumbersModule {}
