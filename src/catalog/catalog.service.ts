/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import {
  CreateBaseProductDto,
  UpdateBaseProductDto,
  ProductSearchParamsDto,
} from './dto';
import { BaseProduct, PrintableArea } from './entities';
import { BaseProductsResponse } from './types/catalog.types';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(BaseProduct)
    private readonly baseProductRepository: Repository<BaseProduct>,
    @InjectRepository(PrintableArea)
    private readonly printableAreaRepository: Repository<PrintableArea>,
  ) {}

  /**
   * Create a new base product with print areas
   */
  async create(
    createBaseProductDto: CreateBaseProductDto,
  ): Promise<BaseProduct> {
    // Check for duplicate title + brand combination
    const existingProduct = await this.baseProductRepository.findOne({
      where: {
        title: createBaseProductDto.title,
        brand: createBaseProductDto.brand,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product with title "${createBaseProductDto.title}" already exists for brand "${createBaseProductDto.brand}"`,
      );
    }

    // Create the base product entity
    const baseProduct = this.baseProductRepository.create({
      title: createBaseProductDto.title,
      description: createBaseProductDto.description,
      brand: createBaseProductDto.brand,
      type: createBaseProductDto.type,
      category: createBaseProductDto.category,
      material: createBaseProductDto.material,
      base_cost: createBaseProductDto.base_cost,
      currency: createBaseProductDto.currency || 'USD',
      country: createBaseProductDto.country,
      mainImage: createBaseProductDto.mainImage,
      colors: createBaseProductDto.colors,
      available_sizes: createBaseProductDto.available_sizes,
      tags: createBaseProductDto.tags,
      metadata: createBaseProductDto.metadata,
    });

    // Save the base product first to get the ID
    const savedProduct = await this.baseProductRepository.save(baseProduct);

    // Create and save print areas
    const printAreas = createBaseProductDto.printAreas.map((printAreaDto) =>
      this.printableAreaRepository.create({
        ...printAreaDto,
        baseProductId: savedProduct.id,
      }),
    );

    await this.printableAreaRepository.save(printAreas);

    // Return the complete product with print areas
    return this.findOne(savedProduct.id);
  }

  /**
   * Find all products with optional filtering, sorting, and pagination
   */
  async findAll(
    searchParams: ProductSearchParamsDto = {},
  ): Promise<BaseProductsResponse> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      category,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      country,
      material,
      tags,
    } = searchParams;

    const queryBuilder = this.createBaseQuery();

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(bp.title) LIKE LOWER(:search) OR LOWER(bp.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('bp.category = :category', { category });
    }

    if (brand) {
      queryBuilder.andWhere('bp.brand = :brand', { brand });
    }

    if (color) {
      queryBuilder.andWhere('JSON_CONTAINS(bp.colors, :color)', {
        color: `"${color}"`,
      });
    }

    if (size) {
      queryBuilder.andWhere(
        '(JSON_CONTAINS_PATH(bp.available_sizes, "one", :sizePath) OR JSON_SEARCH(bp.available_sizes, "one", :size) IS NOT NULL)',
        { sizePath: `$.${size}`, size },
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere('bp.base_cost BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        queryBuilder.andWhere('bp.base_cost >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        queryBuilder.andWhere('bp.base_cost <= :maxPrice', { maxPrice });
      }
    }

    if (country) {
      queryBuilder.andWhere('bp.country = :country', { country });
    }

    if (material) {
      queryBuilder.andWhere('bp.material LIKE :material', {
        material: `%${material}%`,
      });
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags
        .map((_, index) => `JSON_CONTAINS(bp.tags, :tag${index})`)
        .join(' OR ');
      queryBuilder.andWhere(
        `(${tagConditions})`,
        tags.reduce(
          (params, tag, index) => ({ ...params, [`tag${index}`]: `"${tag}"` }),
          {},
        ),
      );
    }

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute queries
    const [items, total] = await queryBuilder.getManyAndCount();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrevious,
    };
  }

  /**
   * Find a single product by ID
   */
  async findOne(id: string): Promise<BaseProduct> {
    const product = await this.baseProductRepository.findOne({
      where: { id },
      relations: ['printAreas'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  /**
   * Update a product by ID
   */
  async update(
    id: string,
    updateBaseProductDto: UpdateBaseProductDto,
  ): Promise<BaseProduct> {
    const existingProduct = await this.findOne(id);

    // Check for duplicate title + brand if they're being updated
    if (updateBaseProductDto.title || updateBaseProductDto.brand) {
      const title = updateBaseProductDto.title || existingProduct.title;
      const brand = updateBaseProductDto.brand || existingProduct.brand;

      const duplicateProduct = await this.baseProductRepository.findOne({
        where: { title, brand },
      });

      if (duplicateProduct && duplicateProduct.id !== id) {
        throw new ConflictException(
          `Product with title "${title}" already exists for brand "${brand}"`,
        );
      }
    }

    // Update the base product
    await this.baseProductRepository.update(id, {
      title: updateBaseProductDto.title,
      description: updateBaseProductDto.description,
      brand: updateBaseProductDto.brand,
      type: updateBaseProductDto.type,
      category: updateBaseProductDto.category,
      material: updateBaseProductDto.material,
      base_cost: updateBaseProductDto.base_cost,
      currency: updateBaseProductDto.currency,
      country: updateBaseProductDto.country,
      mainImage: updateBaseProductDto.mainImage,
      colors: updateBaseProductDto.colors,
      available_sizes: updateBaseProductDto.available_sizes,
      tags: updateBaseProductDto.tags,
      metadata: updateBaseProductDto.metadata,
    });

    // Update print areas if provided
    if (updateBaseProductDto.printAreas) {
      // Remove existing print areas
      await this.printableAreaRepository.delete({ baseProductId: id });

      // Create new print areas
      const printAreas = updateBaseProductDto.printAreas.map((printAreaDto) =>
        this.printableAreaRepository.create({
          ...printAreaDto,
          baseProductId: id,
        }),
      );

      await this.printableAreaRepository.save(printAreas);
    }

    return this.findOne(id);
  }

  /**
   * Soft delete a product by ID
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.baseProductRepository.softDelete(id);
  }

  /**
   * Hard delete a product by ID (admin only)
   */
  async hardDelete(id: string): Promise<void> {
    await this.findOne(id);
    await this.baseProductRepository.delete(id);
  }

  /**
   * Restore a soft-deleted product
   */
  async restore(id: string): Promise<BaseProduct> {
    await this.baseProductRepository.restore(id);
    return this.findOne(id);
  }

  /**
   * Get products by category
   */
  async findByCategory(
    category: string,
    searchParams: ProductSearchParamsDto = {},
  ): Promise<BaseProductsResponse> {
    return this.findAll({ ...searchParams, category });
  }

  /**
   * Get products by brand
   */
  async findByBrand(
    brand: string,
    searchParams: ProductSearchParamsDto = {},
  ): Promise<BaseProductsResponse> {
    return this.findAll({ ...searchParams, brand });
  }

  /**
   * Search products by title or description
   */
  async search(
    query: string,
    searchParams: ProductSearchParamsDto = {},
  ): Promise<BaseProductsResponse> {
    return this.findAll({ ...searchParams, search: query });
  }

  /**
   * Get product statistics
   */
  async getStatistics() {
    const totalProducts = await this.baseProductRepository.count();
    const productsByCategory = await this.baseProductRepository
      .createQueryBuilder('bp')
      .select('bp.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('bp.category')
      .getRawMany();

    const productsByBrand = await this.baseProductRepository
      .createQueryBuilder('bp')
      .select('bp.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .groupBy('bp.brand')
      .getRawMany();

    return {
      totalProducts,
      productsByCategory,
      productsByBrand,
    };
  }
  /**
   * Get catalog statistics
   */
  async getCatalogStats() {
    // Get total and active products count
    const [totalProducts, activeProducts] = await Promise.all([
      this.baseProductRepository.count(),
      this.baseProductRepository.count({ where: { deletedAt: IsNull() } }),
    ]);

    const deletedProducts = totalProducts - activeProducts;

    // Get unique categories and brands count
    const [categoriesResult, brandsResult] = await Promise.all([
      this.baseProductRepository
        .createQueryBuilder('bp')
        .select('COUNT(DISTINCT bp.category)', 'count')
        .where('bp.deletedAt IS NULL')
        .getRawOne(),
      this.baseProductRepository
        .createQueryBuilder('bp')
        .select('COUNT(DISTINCT bp.brand)', 'count')
        .where('bp.deletedAt IS NULL')
        .getRawOne(),
    ]);

    // Get price statistics
    const priceStats = await this.baseProductRepository
      .createQueryBuilder('bp')
      .select([
        'AVG(bp.base_cost) as average',
        'MIN(bp.base_cost) as min',
        'MAX(bp.base_cost) as max',
      ])
      .where('bp.deletedAt IS NULL')
      .getRawOne();

    return {
      totalProducts,
      activeProducts,
      deletedProducts,
      categoriesCount: parseInt(categoriesResult?.count || '0'),
      brandsCount: parseInt(brandsResult?.count || '0'),
      averagePrice: parseFloat(priceStats?.average || '0'),
      priceRange: {
        min: parseFloat(priceStats?.min || '0'),
        max: parseFloat(priceStats?.max || '0'),
      },
    };
  }

  /**
   * Create base query with common joins and selections
   */
  private createBaseQuery(): SelectQueryBuilder<BaseProduct> {
    return this.baseProductRepository
      .createQueryBuilder('bp')
      .leftJoinAndSelect('bp.printAreas', 'pa')
      .where('bp.deletedAt IS NULL');
  }

  /**
   * Map sort field names to database columns
   */
  private getSortField(sortBy: string): string {
    const sortMapping = {
      title: 'bp.title',
      base_cost: 'bp.base_cost',
      createdAt: 'bp.createdAt',
      updatedAt: 'bp.updatedAt',
    };

    return sortMapping[sortBy] || 'bp.createdAt';
  }
}
