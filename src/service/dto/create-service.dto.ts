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
import { productsModelEnum } from 'src/common/enum';


export class CreateServiceDto {
  @IsEnum(productsModelEnum, {
    message: `Possible services models are ${Object.values(productsModelEnum)}`,
  })
  serviceModel: productsModelEnum;

  @IsString()
  serviceType: string;

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  serviceImage: string[];

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsUUID()
  business_id: string;
}
