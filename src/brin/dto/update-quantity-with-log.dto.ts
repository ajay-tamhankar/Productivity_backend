import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateQuantityWithLogDto {
  @ApiProperty({ example: 100, description: 'The new actual quantity' })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'Found extra parts in basket', description: 'Brief explanation for the quantity change' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
