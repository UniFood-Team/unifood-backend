import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({ description: "The user's first name", example: 'Raquel' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: "The user's last name", example: 'Silva' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "The user's email address",
    example: 'raquel.silva@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: "The user's phone number",
    example: '9299216478',
  })
  @IsOptional()
  telefone?: string;

  @ApiPropertyOptional({
    description: 'formaPagamento',
    example: 'formaPagamento',
  })
  @IsOptional()
  formaPagamento?: string;

  @ApiPropertyOptional({
    description: 'nomeEstabelecimento',
    example: 'nomeEstabelecimento',
  })
  @IsOptional()
  nomeEstabelecimento?: string;

  @ApiPropertyOptional({
    description: 'categorias',
    example: ['Pizza', 'Bebidas'],
  })
  @IsOptional()
  categorias?: string[];

  @ApiProperty({ description: "The user's password", example: '12345678' })
  @IsNotEmpty()
  @Length(8, 100)
  password: string;

  @ApiProperty({
    description: "The user's role",
    example: 'cliente',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
