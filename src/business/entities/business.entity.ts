import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { businessModelEnum } from '../enum/businessModelEnum';

@Entity('business')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  business_id: string;

  @Column('text', {
    unique: true,
    nullable: false,
    default: businessModelEnum.business,
  })
  businessModel: businessModelEnum;

  @Column('varchar', { nullable: false, default: '' })
  businessType: string;

  @Column('text', { default: '' })
  coverImage: string[];

  @Column('varchar', { default: '' })
  profileImage: string;

  @Column('varchar', { unique: true, default: '' })
  name: string;

  @Column('varchar', { nullable: true, default: 'Empty Slogan' })
  slogan?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar', { nullable: false, unique: true })
  address: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  dateEvent?: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  dateStartEvent?: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  dateEndEvent?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { nullable: true, default: false })
  isActive?: boolean;

  @DeleteDateColumn() // Agrega esta línea para soportar soft delete
  deletedAt?: Date;
}
