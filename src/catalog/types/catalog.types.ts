/**
 * Catalog module TypeScript interfaces and types
 * Centralized type definitions for catalog operations
 */

export interface PrintableArea {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mockupUrl: string;
  dpi?: number;
  baseProductId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}

export interface ProductMetadata {
  material?: string;
  care_instructions?: string;
  weight_grams?: number;
  dimensions?: ProductDimensions;
}

export interface BaseItem {
  id: string;
  title: string;
  description?: string;
  brand: string;
  type?: string;
  category?: string;
  material?: string;
  base_cost: number;
  currency: string;
  country?: string;
  mainImage?: string;
  colors: string[];
  available_sizes: Record<string, number> | string[];
  tags?: string[];
  metadata?: ProductMetadata;
  printAreas: PrintableArea[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface BaseProductsResponse {
  items: BaseItem[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  material?: string;
  search?: string;
  tags?: string[];
}

export interface ProductSearchParams extends ProductFilters {
  sortBy?: 'title' | 'base_cost' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type ProductCategory =
  | 'tshirts'
  | 'hoodies'
  | 'totebags'
  | 'mugs'
  | 'other';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'title' | 'base_cost' | 'createdAt' | 'updatedAt';
