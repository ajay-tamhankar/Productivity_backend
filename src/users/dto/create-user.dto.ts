import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'operator2' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Operator Two' })
  @IsString()
  name: string;

  @ApiProperty({ enum: Role, example: Role.OPERATOR })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
