/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { BaseProduct } from './entities';
import {
  CreateBaseProductDto,
  UpdateBaseProductDto,
  ProductSearchParamsDto,
} from './dto';

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: jest.Mocked<CatalogService>;

  const mockBaseProduct: BaseProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test T-Shirt',
    description: 'A comfortable cotton t-shirt',
    brand: 'TestBrand',
    type: 'apparel',
    category: 'tshirts',
    material: 'cotton',
    base_cost: 25.99,
    currency: 'USD',
    country: 'USA',
    mainImage: 'https://example.com/tshirt.jpg',
    colors: ['black', 'white', 'gray'],
    available_sizes: { S: 10, M: 15, L: 20, XL: 10 },
    tags: ['casual', 'cotton'],
    metadata: {
      material: 'cotton',
      care_instructions: 'Machine wash cold',
      weight_grams: 150,
      dimensions: {
        length_cm: 70,
        width_cm: 50,
        height_cm: 1,
      },
    },
    printAreas: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: CreateBaseProductDto = {
    title: 'Test T-Shirt',
    description: 'A comfortable cotton t-shirt',
    brand: 'TestBrand',
    type: 'apparel',
    category: 'tshirts',
    material: 'cotton',
    base_cost: 25.99,
    currency: 'USD',
    country: 'USA',
    mainImage: 'https://example.com/tshirt.jpg',
    colors: ['black', 'white', 'gray'],
    available_sizes: { S: 10, M: 15, L: 20, XL: 10 },
    tags: ['casual', 'cotton'],
    metadata: {
      material: 'cotton',
      care_instructions: 'Machine wash cold',
      weight_grams: 150,
      dimensions: {
        length_cm: 70,
        width_cm: 50,
        height_cm: 1,
      },
    },
    printAreas: [],
  };

  beforeEach(async () => {
    const mockCatalogService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
      search: jest.fn(),
      findByCategory: jest.fn(),
      findByBrand: jest.fn(),
      getCatalogStats: jest.fn(),
      getStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get(CatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new base product', async () => {
      service.create.mockResolvedValue(mockBaseProduct);

      const result = await controller.create(mockCreateDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockBaseProduct);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockSearchParams: ProductSearchParamsDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        items: [mockBaseProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockSearchParams);

      expect(service.findAll).toHaveBeenCalledWith(mockSearchParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      service.findOne.mockResolvedValue(mockBaseProduct);

      const result = await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockBaseProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateBaseProductDto = {
        title: 'Updated T-Shirt',
      };

      const updatedProduct = { ...mockBaseProduct, title: 'Updated T-Shirt' };
      service.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(productId, updateDto);

      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      service.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(productId);
    });
  });

  describe('search', () => {
    it('should search products by query', async () => {
      const query = 'tshirt';
      const searchParams: ProductSearchParamsDto = {
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        items: [mockBaseProduct],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      service.search.mockResolvedValue(mockResponse);

      const result = await controller.search(query, searchParams);

      expect(service.search).toHaveBeenCalledWith(query, searchParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCatalogStats', () => {
    it('should return catalog statistics', async () => {
      const mockStats = {
        totalProducts: 10,
        activeProducts: 8,
        deletedProducts: 2,
        categoriesCount: 5,
        brandsCount: 3,
        averagePrice: 25.99,
        priceRange: {
          min: 9.99,
          max: 49.99,
        },
      };

      service.getCatalogStats.mockResolvedValue(mockStats);

      const result = await controller.getCatalogStats();

      expect(service.getCatalogStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
