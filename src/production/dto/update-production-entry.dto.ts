import { PartialType } from '@nestjs/swagger';
import { CreateProductionEntryDto } from './create-production-entry.dto';

export class UpdateProductionEntryDto extends PartialType(CreateProductionEntryDto) {}
