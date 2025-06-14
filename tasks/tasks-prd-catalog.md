# Task List: Catalog (Base Print-less Products)

## Relevant Files

- `src/catalog/catalog.module.ts` - Main catalog module that imports all catalog-related components.
- `src/catalog/catalog.controller.ts` - REST API controller for catalog endpoints (admin and creator access).
- `src/catalog/catalog.controller.spec.ts` - Unit tests for catalog controller.
- `src/catalog/catalog.service.ts` - Business logic service for catalog operations.
- `src/catalog/catalog.service.spec.ts` - Unit tests for catalog service.
- `src/catalog/entities/base-product.entity.ts` - TypeORM entity for base products.
- `src/catalog/entities/printable-area.entity.ts` - TypeORM entity for printable areas.
- `src/catalog/entities/product-metadata.entity.ts` - TypeORM entity for product metadata.
- `src/catalog/entities/index.ts` - Barrel export for all catalog entities.
- `src/catalog/dto/create-base-product.dto.ts` - DTO for creating base products.
- `src/catalog/dto/update-base-product.dto.ts` - DTO for updating base products.
- `src/catalog/dto/base-product-response.dto.ts` - DTO for API responses.
- `src/catalog/dto/product-filters.dto.ts` - DTO for search and filter parameters.
- `src/catalog/dto/index.ts` - Barrel export for all catalog DTOs.
- `src/catalog/types/catalog.types.ts` - TypeScript interfaces and types for catalog.
- `src/migrations/CreateCatalogSchema.ts` - Database migration for catalog tables.
- `src/uploads/uploads.service.ts` - Extended to handle catalog image uploads (existing file).

### Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Use nest cli to generate files, e.g., `nest g resource catalog` or `nest g controller catalog`.
- The catalog module will integrate with existing uploads service for image handling.
- Database migrations should be generated using TypeORM: `npm run migration:generate -- src/migrations/CreateCatalogSchema`.

## Tasks

- [ ] 1.0 Create Database Schema and Entities
  - [ ] 1.1 Design and create BaseProduct entity with all required fields from BaseItem interface
  - [ ] 1.2 Create PrintableArea entity with coordinates, dimensions, and mockup URL
  - [ ] 1.3 Create ProductMetadata entity for additional product specifications
  - [ ] 1.4 Set up proper entity relationships and constraints
  - [ ] 1.5 Generate and run database migration for catalog schema
  - [ ] 1.6 Add database indexes for performance optimization (category, brand, price, search fields)

- [ ] 2.0 Develop Core Catalog Module with CRUD Operations
  - [ ] 2.1 Generate catalog module using NestJS CLI (`nest g resource catalog`)
  - [ ] 2.2 Create comprehensive DTOs for create, update, and response operations
  - [ ] 2.3 Implement catalog service with basic CRUD operations (create, read, update, delete)
  - [ ] 2.4 Create catalog controller with RESTful endpoints for admin operations
  - [ ] 2.5 Add proper error handling and validation for all operations
  - [ ] 2.6 Implement TypeORM repository integration for database operations
  - [ ] 2.7 Add unit tests for catalog service and controller

- [ ] 3.0 Implement Image Upload and Management System
  - [ ] 3.1 Extend uploads service to handle catalog product images and mockups
  - [ ] 3.2 Create specific upload methods for main product images and print area mockups
  - [ ] 3.3 Implement image validation (format: JPEG, PNG, WebP; size limits; resolution requirements)
  - [ ] 3.4 Add organized storage structure in GCS (`/catalog/products/{id}/images/`, `/catalog/products/{id}/mockups/`)
  - [ ] 3.5 Implement image deletion when products are updated or removed
  - [ ] 3.6 Add print area coordinate validation against product dimensions
  - [ ] 3.7 Create endpoints for uploading product images and print area mockups

- [ ] 4.0 Add Authentication, Authorization and Input Validation
  - [ ] 4.1 Integrate Firebase authentication guard for all catalog endpoints
  - [ ] 4.2 Implement role-based access control (admins: full CRUD, creators: read-only)
  - [ ] 4.3 Add input validation using class-validator for all DTOs
  - [ ] 4.4 Implement proper error responses and HTTP status codes
  - [ ] 4.5 Add request sanitization and security validation
  - [ ] 4.6 Create authorization guards specific to catalog operations
  - [ ] 4.7 Add integration tests for authentication and authorization

- [ ] 5.0 Build Advanced Search and Filtering API
  - [ ] 5.1 Implement basic product listing with pagination support
  - [ ] 5.2 Add filtering capabilities (category, brand, color, size, price range, material, country)
  - [ ] 5.3 Implement full-text search across product titles and descriptions using PostgreSQL
  - [ ] 5.4 Add sorting options (title, price, creation date, update date with asc/desc)
  - [ ] 5.5 Create search and filter DTOs with proper validation
  - [ ] 5.6 Optimize database queries for search and filter operations
  - [ ] 5.7 Add creator-specific endpoints for browsing catalog
  - [ ] 5.8 Implement response caching for frequently accessed catalog data
