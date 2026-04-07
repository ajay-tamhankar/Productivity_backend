import { PartialType } from '@nestjs/swagger';
import { CreateMachineNumberDto } from './create-machine-number.dto';

export class UpdateMachineNumberDto extends PartialType(CreateMachineNumberDto) {}
