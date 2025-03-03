import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";


export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'Ho many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    page?: number = 1;
    
    @ApiProperty({
        default: 0,
        description: 'How many rows do you wnat to skip'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number = 10;
}