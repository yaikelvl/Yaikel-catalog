import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'Array of valid URLs to be associated with a business',
    example: ['https://example.com', 'https://business.com/contact'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsUrl({}, { each: true })
  urls: string[];
}
