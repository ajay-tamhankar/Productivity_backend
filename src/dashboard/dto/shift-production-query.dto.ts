import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ShiftProductionQueryDto {
  @ApiProperty({ example: '2026-03-17' })
  @IsDateString()
  date: string;
}
