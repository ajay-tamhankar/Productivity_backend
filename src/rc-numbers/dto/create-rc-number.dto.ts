import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateRcNumberDto {
  @ApiProperty({ example: 'RC-001' })
  @IsString()
  @MinLength(1)
  value: string;
}
