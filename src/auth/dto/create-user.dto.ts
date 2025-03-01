import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsPhoneNumber()
  @MinLength(8)
  phone: number;

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
