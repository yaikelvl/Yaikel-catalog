import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { currencyEnum, productsModelEnum } from '../../common/enum';

export class CreateProductDto {
  @ApiProperty({
    description: 'Model of the product',
    example: productsModelEnum.ofert,
  })
  @IsEnum(productsModelEnum, {
    message: `Possible product models are ${Object.values(productsModelEnum)}`,
  })
  productModel: productsModelEnum;

  @ApiProperty({
    description: 'Type of product',
    example: 'Electronics',
  })
  @IsString()
  productType: string;

  @ApiProperty({
    description: 'Array of product images',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  productImage: string[];

  @ApiProperty({
    description: 'Name of the product',
    example: 'Smartphone X',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the product',
    example: 'A high-end smartphone with a powerful camera',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 599.99,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Currency of the product price',
    example: currencyEnum.USD,
  })
  @IsEnum(currencyEnum, {
    message: `Possible currency types are ${Object.values(currencyEnum)}`,
  })
  currency: currencyEnum;

  @ApiProperty({
    description: 'ID of the associated business',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  business_id: string;

  @ApiProperty({
    description: 'ID of the associated category',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsUUID()
  category_id: string;
}
