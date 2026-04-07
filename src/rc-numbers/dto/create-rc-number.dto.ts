import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRcNumberDto {
  @ApiProperty({ example: 'RC-001' })
  @IsString()
  @MinLength(1)
  rcNumber: string;

  @ApiPropertyOptional({ example: 'Description for RC Number' })
  @IsOptional()
  @IsString()
  description?: string;
}
