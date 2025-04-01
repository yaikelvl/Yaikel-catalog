import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({
    description: 'Array of phone numbers following the Cuban format (+53XXXXXXXX)',
    example: ['+5351525354', '+5350123456'],
  })
  @IsString({ each: true })
  @Matches(/^\+53\d{8}$/, {
    message: 'The phone number is not valid for Cuba. Example: +5351525354',
    each: true,
  })
  phone: string[];

  @ApiProperty({
    description: 'Array of valid URLs associated with the business',
    example: ['https://business.com', 'https://facebook.com/business'],
    required: false,
  })
  @IsString({ each: true })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  url?: string[];

  @ApiProperty({
    description: 'UUID of the associated business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  business_id: string;
}
