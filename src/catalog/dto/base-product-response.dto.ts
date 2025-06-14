import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrintableAreaResponseDto {
  @ApiProperty({ description: 'Print area ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Name of the print area' })
  name?: string;

  @ApiProperty({ description: 'X coordinate (mm)' })
  x: number;

  @ApiProperty({ description: 'Y coordinate (mm)' })
  y: number;

  @ApiProperty({ description: 'Width (mm)' })
  width: number;

  @ApiProperty({ description: 'Height (mm)' })
  height: number;

  @ApiProperty({ description: 'Mockup image URL' })
  mockupUrl: string;

  @ApiPropertyOptional({ description: 'DPI for print quality' })
  dpi?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class BaseProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product title' })
  title: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Brand name' })
  brand: string;

  @ApiPropertyOptional({ description: 'Product type' })
  type?: string;

  @ApiPropertyOptional({ description: 'Product category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Material composition' })
  material?: string;

  @ApiProperty({ description: 'Base cost' })
  base_cost: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiPropertyOptional({ description: 'Country of origin' })
  country?: string;

  @ApiPropertyOptional({ description: 'Main product image URL' })
  mainImage?: string;

  @ApiProperty({ description: 'Available colors', type: [String] })
  colors: string[];

  @ApiProperty({ description: 'Available sizes' })
  available_sizes: Record<string, number> | string[];

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
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

  @ApiProperty({ description: 'Print areas', type: [PrintableAreaResponseDto] })
  printAreas: PrintableAreaResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  deletedAt?: Date;
}

export class BaseProductsListResponseDto {
  @ApiProperty({
    description: 'List of products',
    type: [BaseProductResponseDto],
  })
  items: BaseProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  total: number;

  @ApiPropertyOptional({ description: 'Current page number' })
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  limit?: number;

  @ApiPropertyOptional({ description: 'Total number of pages' })
  totalPages?: number;

  @ApiPropertyOptional({ description: 'Has next page' })
  hasNext?: boolean;

  @ApiPropertyOptional({ description: 'Has previous page' })
  hasPrevious?: boolean;
}
