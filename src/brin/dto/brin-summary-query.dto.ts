import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DateRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'thisWeek',
  THIS_MONTH = 'thisMonth',
  ALL = 'all'
}

export class BrinSummaryQueryDto {
  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Predefined date range',
    enum: DateRange 
  })
  @IsOptional()
  @IsEnum(DateRange)
  range?: DateRange;

  @ApiPropertyOptional({ description: 'Filter by specific RC number' })
  @IsOptional()
  @IsString()
  rcNumber?: string;
}
