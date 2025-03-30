import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UrlContact, Contact } from './entities';
import { BusinessModule } from '../business/business.module';

@Module({
  controllers: [ContactController],
  imports: [TypeOrmModule.forFeature([Contact, UrlContact]), AuthModule, BusinessModule],
  exports: [ContactService, TypeOrmModule],
  providers: [ContactService],
})
export class ContactModule {}
