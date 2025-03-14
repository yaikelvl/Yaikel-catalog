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

  @ManyToOne(() => Business, (business) => business.coverImage)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column('uuid')
  business_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
