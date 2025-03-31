import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationDto } from 'src/common';
import {
  CACHE_MANAGER,
  CacheKey,
  Cache,
} from '@nestjs/cache-manager';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/auth.entity';

@Controller('business')
@Auth()
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(@Body() createBusinessDto: CreateBusinessDto, @GetUser() user: User) {
    const newBusiness = this.businessService.create(createBusinessDto, user);
    await this.cacheManager.del('list-businesses');
    return newBusiness;
  }

  @Get()
  @CacheKey('list-businesses')
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.businessService.findAll(paginationDto, user);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.businessService.findOnePlane(term);
  }
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetUser() user: User,
  ) {
    const updateBusiness = this.businessService.updateNew(
      id,
      updateBusinessDto,
      user,
    );
    await this.cacheManager.del('list-businesses');
    return updateBusiness;
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @GetUser() user: User) {
    const removeBusiness = this.businessService.remove(id, user);
    this.cacheManager.del('list-businesses');
    return removeBusiness;
  }
}
