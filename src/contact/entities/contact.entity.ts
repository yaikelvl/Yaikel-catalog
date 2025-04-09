import { Business } from '../../business/entities/business.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UrlContact } from './urls.entity';

@Entity('contact')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  contact_id: string;

  @Column('text', { nullable: false, array: true })
  phone: string[];

  @Column('uuid')
  business_id: string;

  @OneToMany(() => UrlContact, (url) => url.contact, {
    cascade: true,
    eager: true,
  })
  url?: UrlContact[];

  @OneToOne(() => Business, { cascade: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
