import { Transform } from "class-transformer";
import { IsEmail, IsLowercase, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
