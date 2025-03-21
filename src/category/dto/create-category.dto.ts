import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  subcategory?: string[];

  // @IsNumber()
  // @IsOptional()
  // minPrice?: number;

  // @IsNumber()
  // @IsOptional()
  // maxPrice?: number;

  // @IsEnum(currencyEnum, {
  //   message: `Possible currency type are ${Object.values(currencyEnum)}`,
  // })
  // @IsOptional()
  // currency?: currencyEnum;

  // @IsDate()
  // @IsOptional()
  // date?: Date;
}
