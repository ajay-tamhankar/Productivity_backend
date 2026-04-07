import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateMachineNumberDto {
  @ApiProperty({ example: 'MN-001' })
  @IsString()
  @MinLength(1)
  value: string;
}
