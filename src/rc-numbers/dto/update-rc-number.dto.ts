import { PartialType } from '@nestjs/swagger';
import { CreateRcNumberDto } from './create-rc-number.dto';

export class UpdateRcNumberDto extends PartialType(CreateRcNumberDto) {}
