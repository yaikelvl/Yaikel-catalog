import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, Length, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for user login. It defines the validation rules for user login input data.
 */
export class LoginUserDto {

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
  @Matches(/^\+53\d{8}$/, {
    message: 'The phone number is not valid for Cuba example (+5351525354)',
  })
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
}
