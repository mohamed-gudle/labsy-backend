import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import {
  CreateBaseProductDto,
  UpdateBaseProductDto,
  BaseProductResponseDto,
  BaseProductsListResponseDto,
  ProductSearchParamsDto,
} from './dto';

@ApiTags('catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Create a new base product
   * Admin only endpoint for adding new products to the catalog
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new base product',
    description:
      'Creates a new base product with printable areas. Admin access required.',
  })
  @ApiBody({ type: CreateBaseProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: BaseProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or validation errors',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product with the same title and brand already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async create(
    @Body(ValidationPipe) createBaseProductDto: CreateBaseProductDto,
  ): Promise<BaseProductResponseDto> {
    return this.catalogService.create(createBaseProductDto);
  }

  /**
   * Get all products with filtering, sorting, and pagination
   * Available to both admins and creators
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all base products',
    description:
      'Retrieves a paginated list of base products with optional filtering and sorting.',
  })
  @ApiQuery({ type: ProductSearchParamsDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: BaseProductsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findAll(
    @Query(ValidationPipe) searchParams: ProductSearchParamsDto,
  ): Promise<BaseProductsListResponseDto> {
    return this.catalogService.findAll(searchParams);
  }

  /**
   * Get a single product by ID
   * Available to both admins and creators
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a base product by ID',
    description:
      'Retrieves detailed information about a specific base product including print areas.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: BaseProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseProductResponseDto> {
    return this.catalogService.findOne(id);
  }

  /**
   * Update a product by ID
   * Admin only endpoint
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a base product',
    description: 'Updates an existing base product. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateBaseProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: BaseProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product with the same title and brand already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateBaseProductDto: UpdateBaseProductDto,
  ): Promise<BaseProductResponseDto> {
    return this.catalogService.update(id, updateBaseProductDto);
  }

  /**
   * Soft delete a product by ID
   * Admin only endpoint
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a base product',
    description:
      'Soft deletes a base product (can be restored). Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.catalogService.remove(id);
  }

  /**
   * Hard delete a product by ID
   * Admin only endpoint - permanent deletion
   */
  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete a base product',
    description:
      'Permanently deletes a base product (cannot be restored). Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product permanently deleted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async hardDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.catalogService.hardDelete(id);
  }

  /**
   * Restore a soft-deleted product
   * Admin only endpoint
   */
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore a deleted base product',
    description: 'Restores a soft-deleted base product. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product restored successfully',
    type: BaseProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found or not deleted',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseProductResponseDto> {
    return this.catalogService.restore(id);
  }

  /**
   * Search products by query string
   * Available to both admins and creators
   */
  @Get('search/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search base products',
    description:
      'Searches products by title and description with optional filtering and pagination.',
  })
  @ApiParam({
    name: 'query',
    description: 'Search query string',
    type: 'string',
  })
  @ApiQuery({ type: ProductSearchParamsDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Search results retrieved successfully',
    type: BaseProductsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async search(
    @Param('query') query: string,
    @Query(ValidationPipe) searchParams: ProductSearchParamsDto,
  ): Promise<BaseProductsListResponseDto> {
    return this.catalogService.search(query, searchParams);
  }

  /**
   * Get products by category
   * Available to both admins and creators
   */
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get products by category',
    description:
      'Retrieves products filtered by category with optional additional filtering and pagination.',
  })
  @ApiParam({
    name: 'category',
    description: 'Product category',
    type: 'string',
  })
  @ApiQuery({ type: ProductSearchParamsDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: BaseProductsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findByCategory(
    @Param('category') category: string,
    @Query(ValidationPipe) searchParams: ProductSearchParamsDto,
  ): Promise<BaseProductsListResponseDto> {
    return this.catalogService.findByCategory(category, searchParams);
  }

  /**
   * Get products by brand
   * Available to both admins and creators
   */
  @Get('brand/:brand')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get products by brand',
    description:
      'Retrieves products filtered by brand with optional additional filtering and pagination.',
  })
  @ApiParam({
    name: 'brand',
    description: 'Product brand',
    type: 'string',
  })
  @ApiQuery({ type: ProductSearchParamsDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: BaseProductsListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findByBrand(
    @Param('brand') brand: string,
    @Query(ValidationPipe) searchParams: ProductSearchParamsDto,
  ): Promise<BaseProductsListResponseDto> {
    return this.catalogService.findByBrand(brand, searchParams);
  }

  /**
   * Get catalog statistics
   * Admin only endpoint
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get catalog statistics',
    description:
      'Retrieves comprehensive catalog statistics including product counts, categories, brands, and pricing data. Admin access required.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: {
          type: 'number',
          description: 'Total number of products',
        },
        activeProducts: {
          type: 'number',
          description: 'Number of active (non-deleted) products',
        },
        deletedProducts: {
          type: 'number',
          description: 'Number of soft-deleted products',
        },
        categoriesCount: {
          type: 'number',
          description: 'Number of unique categories',
        },
        brandsCount: { type: 'number', description: 'Number of unique brands' },
        averagePrice: { type: 'number', description: 'Average product price' },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number', description: 'Minimum product price' },
            max: { type: 'number', description: 'Maximum product price' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async getCatalogStats() {
    return this.catalogService.getCatalogStats();
  }

  /**
   * Get basic product statistics
   * Available to both admins and creators
   */
  @Get('stats/basic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get basic product statistics',
    description:
      'Retrieves basic statistics including total products and breakdown by category and brand.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: {
          type: 'number',
          description: 'Total number of products',
        },
        productsByCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'string' },
            },
          },
        },
        productsByBrand: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              brand: { type: 'string' },
              count: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getStatistics() {
    return this.catalogService.getStatistics();
  }
}
