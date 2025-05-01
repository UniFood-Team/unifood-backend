import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
}
