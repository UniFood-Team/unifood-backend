import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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

  //   @ApiProperty({
  //     description: "The user's roles",
  //     example: ['viewer', 'editor', 'admin'],
  //   })
  //   @IsArray()
  //   @IsOptional()
  //   @IsString({ each: true })
  //   roles?: string[];
}
