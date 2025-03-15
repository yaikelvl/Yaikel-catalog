import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, Inject } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationDto } from 'src/common';
import { CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL, Cache } from '@nestjs/cache-manager';

@Controller('business')
// @UseInterceptors(CacheInterceptor)
export class BusinessController {
  constructor(private readonly businessService: BusinessService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.businessService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.businessService.findOnePlane(term);
  }
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.updateNew(id, updateBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.businessService.remove(id);
  }
}
