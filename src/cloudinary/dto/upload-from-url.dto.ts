import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UploadFromUrlDto {
  @IsUrl()
  imageUrl: string;

  @IsString()
  @IsOptional()
  publicId?: string;

  @IsString()
  @IsOptional()
  folder?: string;
}