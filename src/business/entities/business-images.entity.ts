import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Business } from '.';

@Entity()
export class BusinessImages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @Column('text')
  image_public_id: string;

  @ManyToOne(() => Business, (business) => business.coverImage)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column('uuid')
  business_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
