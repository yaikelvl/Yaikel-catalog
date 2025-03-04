import {
  IsArray,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidRoles } from '../enum/valid-roles';

export class CreateUserDto {
  @IsString()
  @Length(11)
  @Matches(/^\+53\d{8}$/, { message: 'The phone number is not valid for Cuba example (+5351525354)' })
  phone: string;

  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ValidRoles, {
      each: true,
      message: `Possible roles for users are ${Object.values(ValidRoles)}`,
    })
  role?: ValidRoles[];
}
