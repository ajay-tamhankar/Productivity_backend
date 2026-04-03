import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'operator1' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'ChangeMe123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
