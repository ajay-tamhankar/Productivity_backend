import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class RejectionDetailDto {
  @ApiProperty({ example: 'Scratch' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
