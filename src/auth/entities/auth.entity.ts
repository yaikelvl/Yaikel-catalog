import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true, nullable: false })
  email: string;

  @Column('text', { nullable: false , select: false})
  password: string;

  @Column({
    type: 'text',
    array: true,
    nullable: false,
    default: ['USER'],
  })
  role: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @BeforeInsert()
  checkEmailBeforeInsert(){
    this.email = this.email.toLowerCase().trim();
    this.role = this.role.map(role => role.toUpperCase().trim());
  }

  @BeforeUpdate()
  checkEmailBeforeUpdate(){
    this.checkEmailBeforeInsert();
  }
}
