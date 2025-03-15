import { IsArray, IsString, IsUrl } from "class-validator";

export class CreateUrlDto {
 @IsString({ each: true })
  @IsArray()
  @IsUrl({}, { each: true })
  urls: string[];
}