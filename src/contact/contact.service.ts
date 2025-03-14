import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlContact } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Business } from 'src/business/entities';

@Injectable()
export class ContactService {

  private readonly logger = new Logger('ContactService');

constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(UrlContact)
    private readonly urlContRepository: Repository<UrlContact>,

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    private readonly dataSource: DataSource,

    // @Inject(CACHE_MANAGER) private cacheManager: Cache) 
    )
    {}



   async create(createContactDto: CreateContactDto) {
     try {
       const user = await this.businessRepository.findOneBy({
        business_id : createContactDto.business_id,
       });
 
       if (!user) {
         throw new BadRequestException(
           `User with id ${createContactDto.business_id} not found`,
         );
       }
 
       const { url = [], ...contactDetails } = createContactDto;
 
       const contact = this.contactRepository.create({
         ...contactDetails,
         url: url.map((url) =>
           this.urlContRepository.create({ url }),
         ),

       });
       await this.contactRepository.save(contact);
       return { ...contact, url };
     } catch (error) {
       this.handelExeption(error);
     }
   }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }

  private handelExeption(error: any) {
      if (error.code === '23505') throw new BadRequestException(error.detail);
  
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Unexpecte error, check server logs',
      );
    }
}
