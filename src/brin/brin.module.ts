import { Module } from '@nestjs/common';
import { BrinController } from './brin.controller';
import { BrinService } from './brin.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BrinController],
  providers: [BrinService],
})
export class BrinModule {}
