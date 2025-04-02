import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Main category name',
    example: 'Food & Beverages',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'Array of subcategories',
    example: ['Restaurants', 'Cafes', 'Bars'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  subcategory?: string[];
}
