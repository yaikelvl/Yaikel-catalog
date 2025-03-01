import { Transform } from "class-transformer";
import { IsEmail, IsLowercase, IsNumber, IsPhoneNumber, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
  @IsNumber()
  @IsPhoneNumber()
  phone: number;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
