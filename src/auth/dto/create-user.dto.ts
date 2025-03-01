import {
    IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  isStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  role?: string[];
}
