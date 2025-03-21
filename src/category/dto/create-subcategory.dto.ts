import { IsArray, IsString, IsUrl } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString({ each: true })
  @IsArray()
  sub: string[];
}
