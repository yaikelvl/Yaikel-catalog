import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  
  import { productsModelEnum } from 'src/common/enum';
  import { Business } from 'src/business/entities/business.entity';
  
  @Entity('service')
  export class Service {
    @PrimaryGeneratedColumn('uuid')
    service_id: string;
  
    @Column('varchar', {
      nullable: false,
      default: productsModelEnum.product,
    })
    serviceModel: productsModelEnum;
  
    @Column('varchar', { nullable: false })
    serviceType: string;
  
    @Column('text', { nullable: false })
    serviceImage: string[];
  
    @Column('varchar', { unique: true })
    name: string;
  
    //TODO: falta categoria
  
    @Column('float', { nullable: false, default: 0 })
    price: number;
  
    @Column('text', { nullable: true })
    description?: string;
  
    @Column('uuid')
    business_id: string;
  
    @ManyToOne(() => Business, (business) => business.product)
    @JoinColumn({ name: 'business_id' })
    business: Business;
  
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt?: Date;
  }
  