import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateContactDto {
  @IsString({ each: true })
  @Length(11)
  @Matches(/^\+53\d{8}$/, {
    message: 'The phone number is not valid for Cuba example (+5351525354)',
    each: true,
  })
  phone: string[];

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  @IsOptional()
  url?: string[];

  @IsUUID()
  @IsNotEmpty()
  business_id: string;
}
