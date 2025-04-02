import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class OptimizeImageDto {
  @IsString()
  publicId: string;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  @IsIn(['fill', 'scale', 'crop', 'thumb', 'auto'])
  crop?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  format?: string;
}