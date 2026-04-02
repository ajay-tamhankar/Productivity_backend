import { Module } from '@nestjs/common';
import { IsAfterConstraint } from 'src/common/validators/is-after.validator';
import { IsLessThanOrEqualConstraint } from 'src/common/validators/is-less-than-or-equal.validator';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, IsAfterConstraint, IsLessThanOrEqualConstraint],
  exports: [ProductionService],
})
export class ProductionModule {}
