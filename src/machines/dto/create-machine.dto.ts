import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MachineStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 'M-201' })
  @IsString()
  machineNumber: string;

  @ApiProperty({ example: 'Injection Machine 201' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: MachineStatus, example: MachineStatus.ACTIVE, default: MachineStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;
}
