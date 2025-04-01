import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from '../enum/valid-roles';

/**
 * DTO for creating a user. It defines the validation rules for the user input data.
 */
export class CreateUserDto {
  
  /**
   * Phone number of the user. It must be a valid Cuban phone number.
   * The phone number must be 11 characters long and match the regular expression for Cuban numbers.
   * 
   * @example +5351525354
   */
  @ApiProperty({
    description: 'User phone number. It must be a valid Cuban phone number.',
    example: '+5351525354',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @Length(11)
  @Matches(/^\+53\d{8}$/, { message: 'The phone number is not valid for Cuba example (+5351525354)' })
  phone: string;

  /**
   * Password for the user. It must be a strong password, between 8 and 50 characters in length.
   * The password must meet specific criteria defined by the 'IsStrongPassword' validator.
   * 
   * @example 'Password123!'
   */
  @ApiProperty({
    description: 'User password. It must be a strong password.',
    example: 'Password123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  /**
   * Optional field for the roles of the user. It can accept an array of roles, where each role
   * must be one of the defined valid roles in the ValidRoles enum.
   * 
   * @example ['admin', 'user']
   */
  @ApiProperty({
    description: 'User roles. It can accept an array of valid roles.',
    example: ['admin', 'user'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ValidRoles, {
    each: true,
    message: `Possible roles for users are ${Object.values(ValidRoles)}`,
  })
  role?: ValidRoles[];
}
