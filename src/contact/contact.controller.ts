import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto, CreateUrlDto } from './dto/';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/common';
import { CACHE_MANAGER, CacheKey, Cache } from '@nestjs/cache-manager';

@Controller('contact')
@UseInterceptors(CacheInterceptor)
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    const newContact = this.contactService.create(createContactDto);
    await this.cacheManager.del('list-contacts');
    return newContact;
  }

  @Get()
  @CacheKey('list-contacts')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contactService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.contactService.findOne(term);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const updateContact = this.contactService.update(id, updateContactDto);
    await this.cacheManager.del('list-contacts');
    return updateContact;
  }

  @Post('/url/:id')
  addUrlContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createUrlDto: CreateUrlDto,
  ) {
    return this.contactService.addUrl(id, createUrlDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const removeContact = this.contactService.remove(id);
    await this.cacheManager.del('list-contacts');
    return removeContact;
  }
  
}
