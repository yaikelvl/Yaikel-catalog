import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'Array of subcategory names',
    example: ['Fast Food', 'Vegan', 'Desserts'],
  })
  @IsString({ each: true })
  @IsArray()
  sub: string[];
}
