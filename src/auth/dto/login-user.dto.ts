import { Transform } from 'class-transformer';
import {
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @Length(11)
  @Matches(/^\+53\d{8}$/, {
    message: 'The phone number is not valid for Cuba example (+5351525354)',
  })
  phone: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
