import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { businessModelEnum } from '../../common/enum/business-model.enum';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Business model type',
    enum: businessModelEnum,
    example: businessModelEnum.business,
  })
  @IsEnum(businessModelEnum, {
    message: `Possible business models are ${Object.values(businessModelEnum)}`,
  })
  businessModel: businessModelEnum;

  @ApiProperty({ description: 'Type of business', example: 'Restaurant' })
  @IsString()
  businessType: string;

  @ApiProperty({
    description: 'Array of cover image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  coverImage: string[];

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsUrl()
  profileImage: string;

  @ApiProperty({
    description: 'Business name',
    minLength: 1,
    maxLength: 100,
    example: 'La Bodeguita del Medio',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Business slogan',
    example: 'The best in town!',
  })
  @IsString()
  @IsOptional()
  slogan?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'A cozy place with delicious food and great ambiance.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main Street, Havana, Cuba',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Date of the event',
    example: '2025-06-15',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  dateEvent?: Date;

  @ApiPropertyOptional({
    description: 'Start date of the event',
    example: '2025-06-10',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  dateStartEvent?: Date;

  @ApiPropertyOptional({
    description: 'End date of the event',
    example: '2025-06-20',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  dateEndEvent?: Date;

  @ApiProperty({
    description: 'User ID who owns the business',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Category ID of the business',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsUUID()
  category_id: string;
}
