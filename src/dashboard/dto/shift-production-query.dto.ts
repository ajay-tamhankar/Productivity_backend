import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ShiftProductionQueryDto {
  @ApiPropertyOptional({ example: '2026-03-17' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
