import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { RcNumbersController } from './rc-numbers.controller';
import { RcNumbersService } from './rc-numbers.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RcNumbersController],
  providers: [RcNumbersService],
  exports: [RcNumbersService],
})
export class RcNumbersModule {}
