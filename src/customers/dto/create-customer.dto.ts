import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  customerName: string;
}
