import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ContactController],
  imports: [TypeOrmModule.forFeature([Contact]), AuthModule],
  exports: [ContactService, TypeOrmModule],
  providers: [ContactService],
})
export class ContactModule {}
