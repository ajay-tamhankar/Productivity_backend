import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalStatus, Shift } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfterConstraint } from 'src/common/validators/is-after.validator';
import { IsLessThanOrEqualConstraint } from 'src/common/validators/is-less-than-or-equal.validator';
import { RejectionDetailDto } from './rejection-detail.dto';

export class CreateProductionEntryDto {
  @ApiProperty({ example: '2026-03-17' })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ enum: Shift, example: Shift.A })
  @IsEnum(Shift)
  shift: Shift;

  @ApiProperty({ example: 'operator-user-id' })
  @IsString()
  operatorId: string;

  @ApiProperty({ example: 'machine-id' })
  @IsString()
  machineId: string;

  @ApiProperty({ example: 'item-id' })
  @IsString()
  itemId: string;

  @ApiPropertyOptional({ example: 'rc-number-id', description: 'Optional RC number selection' })
  @IsOptional()
  @IsString()
  rcNumberId?: string;

  @ApiProperty({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  ccd1Quantity: number;

  @ApiProperty({ example: 1200 })
  @IsInt()
  @Min(0)
  actualQuantity: number;

  @ApiProperty({ example: 20, default: 0 })
  @IsInt()
  @Min(0)
  @Validate(IsLessThanOrEqualConstraint, ['actualQuantity'])
  rejectionQuantity: number;

  @ApiProperty({ example: '2026-03-17T08:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-03-17T16:30:00.000Z' })
  @IsDateString()
  @Validate(IsAfterConstraint, ['startTime'])
  endTime: string;

  @ApiPropertyOptional({ example: '2026-03-17T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  machineDowntimeStartTime?: string;

  @ApiPropertyOptional({ example: '2026-03-17T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  machineDowntimeEndTime?: string;

  @ApiPropertyOptional({ enum: ApprovalStatus, example: ApprovalStatus.PENDING })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ example: 'Shift completed without downtime' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [RejectionDetailDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RejectionDetailDto)
  rejectionDetails?: RejectionDetailDto[];
}
