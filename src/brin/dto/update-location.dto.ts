import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 'Warehouse A-12', description: 'The location where the RC is stored' })
  @IsString()
  @IsNotEmpty()
  location: string;
}
