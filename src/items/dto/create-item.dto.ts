import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'ITEM-002' })
  @IsString()
  itemCode: string;

  @ApiProperty({ example: 'Cover Shell' })
  @IsString()
  description: string;

  @ApiProperty({ example: 45.25 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  finishWeight: number;
}
