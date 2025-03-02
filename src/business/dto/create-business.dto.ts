import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { businessModelEnum } from '../enum/businessModelEnum';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(businessModelEnum, {
    message: `Possible business models are ${Object.values(businessModelEnum)}`,
  })
  businessModel: businessModelEnum;

  @IsString()
  businessType: string;

  @IsString()
  @IsArray({ each: true })
  coverImage: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
