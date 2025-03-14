import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Contact } from './contact.entity';


@Entity('url-contact')
export class UrlContact {

    @PrimaryGeneratedColumn()
    url_id: number;

    @Column('text')
      url: string;
    
      @ManyToOne(() => Contact, (contact) => contact.url)
      @JoinColumn({ name: 'contact_id' })
      contact: Contact;
    
      @Column('uuid')
      contact_id: string;
    
      @DeleteDateColumn()
      deletedAt?: Date;
}