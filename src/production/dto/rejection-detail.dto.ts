import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsIn } from 'class-validator';

export const REJECTION_REASONS = [
  'Forging Defects',
  'Rolling Defects',
  'Finishing defects',
  'All Process defect',
];

export class RejectionDetailDto {
  @ApiProperty({
    example: 'Forging Defects',
    enum: REJECTION_REASONS,
  })
  @IsString()
  @IsIn(REJECTION_REASONS)
  reason: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantity: number;
}
