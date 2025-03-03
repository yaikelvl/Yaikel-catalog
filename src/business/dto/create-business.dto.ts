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
import { businessModelEnum } from '../enum/businessModelEnum';
import { User } from 'src/auth/entities/auth.entity';

export class CreateBusinessDto {
  @IsEnum(businessModelEnum, {
    message: `Possible business models are ${Object.values(businessModelEnum)}`,
  })
  businessModel: businessModelEnum;

  @IsString()
  businessType: string;

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  coverImage: string[];

  @IsString()
  @IsUrl()
  profileImage: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  slogan?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsDate()
  @IsOptional()
  dateEvent?: Date;

  @IsDate()
  @IsOptional()
  dateStartEvent?: Date;

  @IsDate()
  @IsOptional()
  dateEndEvent?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @IsUUID()
  userId: string;
}
