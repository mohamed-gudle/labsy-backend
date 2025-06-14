# Product Requirements Document: Catalog (Base Print-less Products)

## Introduction/Overview

The Catalog feature provides a marketplace of base print-less products that creators can browse and customize with their designs. This feature enables admins to upload and manage base products (t-shirts, mugs, hoodies, etc.) while allowing creators to discover available products and understand their printable areas for design customization. The catalog serves as the foundation for Labsy's print-on-demand platform by offering a centralized repository of customizable products.

**Problem Solved:** Currently, creators lack visibility into available base products they can customize, and there's no centralized system for managing the product catalog that forms the core of the POD platform.

**Goal:** Create a comprehensive catalog system that allows admins to manage base products and enables creators to browse and select products for customization.

## Goals

1. **Product Management:** Enable admins to upload, update, and manage base products with complete specifications
2. **Creator Discovery:** Provide creators with an intuitive browsing experience to find suitable products for their designs
3. **Technical Foundation:** Establish a robust data structure and API for future POD functionality
4. **Content Organization:** Implement effective categorization and filtering to help creators find relevant products
5. **Print Area Visualization:** Clearly communicate printable areas and specifications to creators

## User Stories

### Admin Stories
- **As an admin**, I want to upload new base products to the catalog so that creators have more options to customize
- **As an admin**, I want to specify product details (category, materials, sizes, colors, print areas) so that creators have complete information
- **As an admin**, I want to update existing product information so that the catalog stays current and accurate
- **As an admin**, I want to upload product mockup images so that creators can visualize the final product

### Creator Stories
- **As a creator**, I want to browse the catalog of available products so that I can choose which ones to customize
- **As a creator**, I want to filter products by category, brand, size, and color so that I can quickly find suitable products
- **As a creator**, I want to search for specific products by name or description so that I can locate particular items
- **As a creator**, I want to view detailed product specifications (materials, dimensions, print areas) so that I can make informed design decisions
- **As a creator**, I want to see printable area specifications and mockups so that I can design accordingly

## Functional Requirements

### Product Management (Admin)
1. **Product Creation:** The system must allow admins to create new base products with all required fields from the BaseItem interface
2. **Image Upload:** The system must integrate with the existing uploads service to handle product images and mockup uploads
3. **Print Area Definition:** The system must allow admins to define multiple print areas with coordinates, dimensions, and mockup images
4. **Product Validation:** The system must validate all product data according to business rules (required fields, format validation, etc.)
5. **Bulk Operations:** The system must support batch upload/update operations for multiple products

### Product Browsing (Creator)
6. **Product Listing:** The system must provide paginated product listings with configurable page sizes
7. **Advanced Filtering:** The system must support filtering by category, brand, color, size, price range, material, and country
8. **Search Functionality:** The system must provide full-text search across product titles and descriptions
9. **Sorting Options:** The system must allow sorting by title, price, creation date, and update date (ascending/descending)
10. **Product Details:** The system must display complete product information including specifications, images, and print areas

### Data Management
11. **Data Persistence:** The system must store all product data in PostgreSQL using TypeORM entities
12. **Image Storage:** The system must store product images and mockups in Google Cloud Storage
13. **Data Integrity:** The system must maintain referential integrity and prevent data corruption
14. **Performance:** The system must implement efficient querying with proper indexing for search and filter operations

### API Endpoints
15. **CRUD Operations:** The system must provide REST endpoints for Create, Read, Update, Delete operations on products
16. **Search API:** The system must provide dedicated search endpoints with filter and pagination support
17. **File Upload API:** The system must provide endpoints for uploading product images and mockups
18. **Validation:** The system must validate all API inputs using DTOs and class-validator

## Non-Goals (Out of Scope)

1. **Factory Integration:** No integration with print factories or inventory management systems
2. **Customer Access:** Customers cannot access or browse the catalog directly
3. **Creator Product Requests:** Creators cannot request new products to be added to the catalog
4. **Real-time Inventory:** No real-time stock tracking or availability from external sources
5. **Pricing Calculations:** No dynamic pricing or markup calculations (base costs only)
6. **Frontend UI:** No frontend interface development (API-only implementation)
7. **Order Management:** No integration with order processing or fulfillment systems
8. **Multi-language Support:** English-only implementation initially

## Design Considerations

### Data Structure
- **Primary Entity:** BaseProduct entity based on the BaseItem interface
- **Related Entities:** PrintableArea, ProductMetadata, ProductDimensions as embedded objects or separate entities
- **File Storage:** Product images stored in Google Cloud Storage with public URLs
- **Database Schema:** Optimized for read-heavy operations with proper indexing

### API Design
- **RESTful Endpoints:** Follow REST conventions for all CRUD operations
- **Consistent Response Format:** Use BaseProductsResponse interface for list operations
- **Error Handling:** Implement proper HTTP status codes and error messages
- **Pagination:** Support for offset-based pagination with configurable limits

### Integration Points
- **Uploads Service:** Leverage existing UploadService for image handling
- **Authentication:** Integrate with Firebase authentication for admin/creator access control
- **Authorization:** Use role-based access control (admins can manage, creators can read)

## Technical Considerations

### Database Design
- **PostgreSQL Tables:** Products, PrintAreas, and related lookup tables
- **Indexing Strategy:** Indexes on frequently queried fields (category, brand, price, search text)
- **Migration Scripts:** TypeORM migrations for schema creation and updates

### File Handling
- **Image Processing:** Validate image formats and sizes for product photos and mockups
- **Storage Structure:** Organized folder structure in GCS (e.g., `/catalog/products/{id}/images/`)
- **Performance:** Implement image optimization and CDN considerations

### Security
- **Access Control:** Role-based permissions (admins: full access, creators: read-only)
- **File Validation:** Strict validation of uploaded files (type, size, content)
- **Data Sanitization:** Input validation and sanitization for all user inputs

### Performance
- **Caching Strategy:** Consider Redis caching for frequently accessed product data
- **Query Optimization:** Efficient database queries with proper JOIN strategies
- **Pagination:** Implement cursor-based pagination for large datasets

## Success Metrics

1. **Catalog Adoption:** 100% of available base products added to catalog within first month
2. **Creator Engagement:** 80% of active creators browse the catalog within first week of release
3. **Search Efficiency:** Average product discovery time under 30 seconds
4. **System Performance:** API response times under 200ms for catalog browsing
5. **Data Quality:** Zero critical data validation errors in production
6. **Upload Success Rate:** 99% success rate for admin product uploads

## Open Questions

1. **Product Categories:** What are the specific product categories that should be supported initially? tshirts, hoodies, tote bags
2. **Image Requirements:** What are the specific image resolution and format requirements for product photos and mockups? make your best judgement
3. **Print Area Validation:** Should the system validate print area coordinates against product dimensions? yes
4. **Bulk Import:** Is there a need for CSV/Excel import functionality for initial catalog population? no
5. **Version Control:** Should the system maintain version history for product updates? no
6. **Search Indexing:** Should we implement full-text search using PostgreSQL or external search service? no
7. **Cache Strategy:** What caching strategy should be implemented for optimal performance? none
8. **API Rate Limiting:** What rate limiting should be applied to prevent abuse? no rate limiting

---

**Document Version:** 1.0  
**Last Updated:** June 14, 2025  
**Created By:** AI Assistant  
**Target Implementation:** Q3 2025
