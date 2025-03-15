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
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from 'src/common';
import { CreateUrlDto } from './dto';

@Controller('contact')
@UseInterceptors(CacheInterceptor)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contactService.findAll(paginationDto);
  }
  
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.contactService.findOne(term);
  }
  
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }
  
  @Post('/url/:id')
  addUrlContact(@Param('id', ParseUUIDPipe) id: string, @Body() createUrlDto: CreateUrlDto) {
    return this.contactService.addUrl(id, createUrlDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.remove(id);
  }
}
