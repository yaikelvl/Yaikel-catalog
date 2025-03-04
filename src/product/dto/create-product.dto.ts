import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, IsUUID, MaxLength, MinLength } from "class-validator";
import { productsModelEnum } from "src/common/enum";

export class CreateProductDto {
    @IsEnum([productsModelEnum], {
        message: `Possible products models are ${Object.values(productsModelEnum)}`,
      })
      productModel: productsModelEnum;
    
      @IsString()
      productType: string;
    
      @IsString({ each: true })
      @IsArray()
      @IsNotEmpty()
      @IsUrl({}, { each: true })
      productImage: string[];
    
      @IsString()
      @IsNotEmpty()
      @MinLength(1)
      @MaxLength(100)
      name: string;
    
      @IsString()
      @IsOptional()
      description?: string;
    
      @IsNotEmpty()
      @IsString()
      address: string;
    
      @IsNumber()
      @IsPositive()
      price: number;

      @IsString()
      @IsUUID()
      business_id: string;
}
