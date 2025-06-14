import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { BaseProduct } from './base-product.entity';

@Entity('printable_areas')
@Check('x >= 0')
@Check('y >= 0') 
@Check('width > 0')
@Check('height > 0')
@Check('dpi > 0')
export class PrintableArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  x: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  y: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  height: number;

  @Column({ name: 'mockup_url', nullable: false })
  mockupUrl: string;

  @Column({ type: 'int', nullable: true, default: 300 })
  dpi?: number;

  @Column({ name: 'base_product_id', nullable: false })
  baseProductId: string;

  @ManyToOne(() => BaseProduct, (baseProduct) => baseProduct.printAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'base_product_id' })
  baseProduct: BaseProduct;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
