import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  Check,
  Unique,
} from 'typeorm';
import { PrintableArea } from './printable-area.entity';

@Entity('base_products')
@Index(['title'])
@Index(['category'])
@Index(['brand'])
@Index(['base_cost'])
@Index(['country'])
@Index(['createdAt'])
@Check('base_cost > 0')
@Check('LENGTH(title) > 0')
@Unique(['title', 'brand']) // Ensure unique product titles within the same brand
export class BaseProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: false })
  brand: string;

  @Column({ length: 100, nullable: true })
  type?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ length: 255, nullable: true })
  material?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  base_cost: number;

  @Column({ length: 3, default: 'USD', nullable: false })
  currency: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ name: 'main_image', nullable: true })
  mainImage?: string;

  @Column({ type: 'json', nullable: false })
  colors: string[];

  @Column({ type: 'json', nullable: false })
  available_sizes: Record<string, number> | string[];
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: {
    material?: string;
    care_instructions?: string;
    weight_grams?: number;
    dimensions?: {
      length_cm?: number;
      width_cm?: number;
      height_cm?: number;
    };
  };

  @OneToMany(
    () => PrintableArea,
    (printableArea) => printableArea.baseProduct,
    {
      cascade: true,
      eager: true,
    },
  )
  printAreas: PrintableArea[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
