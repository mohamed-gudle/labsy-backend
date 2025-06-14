import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrintableAreaDto {
  @ApiPropertyOptional({
    description:
      'Name of the print area (e.g., "Front", "Back", "Left Sleeve")',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'X coordinate (mm) from the top-left of the mockup',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  x: number;

  @ApiProperty({
    description: 'Y coordinate (mm) from the top-left of the mockup',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  y: number;

  @ApiProperty({ description: 'Width of the printable area (mm)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  width: number;

  @ApiProperty({ description: 'Height of the printable area (mm)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  height: number;

  @ApiProperty({ description: 'WebP mockup image URL for this print area' })
  @IsString()
  @IsNotEmpty()
  mockupUrl: string;

  @ApiPropertyOptional({
    description: 'DPI for print quality (typical: 150-300)',
    default: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  dpi?: number;
}

export class ProductDimensionsDto {
  @ApiPropertyOptional({ description: 'Length in centimeters' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  length_cm?: number;

  @ApiPropertyOptional({ description: 'Width in centimeters' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  width_cm?: number;

  @ApiPropertyOptional({ description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  height_cm?: number;
}

export class ProductMetadataDto {
  @ApiPropertyOptional({ description: 'Material composition' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: 'Care instructions' })
  @IsOptional()
  @IsString()
  care_instructions?: string;

  @ApiPropertyOptional({ description: 'Weight in grams' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight_grams?: number;

  @ApiPropertyOptional({ description: 'Product dimensions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;
}

export class CreateBaseProductDto {
  @ApiProperty({ description: 'Product name/title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Brand name' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiPropertyOptional({ description: 'Product type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Product category',
    enum: ['tshirts', 'hoodies', 'totebags', 'mugs', 'other'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['tshirts', 'hoodies', 'totebags', 'mugs', 'other'])
  category?: string;

  @ApiPropertyOptional({ description: 'Material composition' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ description: 'Base cost in currency units' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  base_cost: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP', 'AED', 'SAR'])
  currency?: string;

  @ApiPropertyOptional({ description: 'Country of origin' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Main product image URL' })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({
    description: 'Available color codes (hex format)',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  colors: string[];

  @ApiProperty({
    description: 'Available sizes with stock quantities or size list',
  })
  @IsNotEmpty()
  available_sizes: Record<string, number> | string[];

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional product metadata' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductMetadataDto)
  metadata?: ProductMetadataDto;

  @ApiProperty({
    description: 'Print areas configuration',
    type: [CreatePrintableAreaDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePrintableAreaDto)
  printAreas: CreatePrintableAreaDto[];
}
