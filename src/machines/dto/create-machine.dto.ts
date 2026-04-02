import { ApiProperty } from '@nestjs/swagger';
import { MachineStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 'M-201' })
  @IsString()
  machineNumber: string;

  @ApiProperty({ example: 'Injection Machine 201' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MachineStatus, example: MachineStatus.ACTIVE })
  @IsEnum(MachineStatus)
  status: MachineStatus;
}
