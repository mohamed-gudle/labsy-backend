# Generic Upload Service Usage Examples

The `UploadsService` has been refactored to provide a generic file upload method that can handle various file types and use cases. Here are examples of how to use it:

## Basic Usage

### 1. Generic File Upload

```typescript
// Upload any file with custom options
const result = await this.uploadsService.uploadFile(file, {
  folder: 'documents',
  userId: 'user-123',
  validation: {
    allowedMimeTypes: ['application/pdf', 'image/jpeg'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
});
```

### 2. Using Predefined File Type Configurations

```typescript
import { FileType, FILE_TYPE_CONFIGS } from './uploads.service';

// Upload an image with predefined validation
const result = await this.uploadsService.uploadFile(file, {
  folder: 'gallery',
  userId: 'user-123',
  validation: FILE_TYPE_CONFIGS[FileType.IMAGE],
});
```

### 3. Convenience Methods

```typescript
// Upload image (automatically applies image validation)
const imageResult = await this.uploadsService.uploadImage(file, {
  folder: 'avatars',
  userId: 'user-123',
});

// Upload document (automatically applies document validation)
const docResult = await this.uploadsService.uploadDocument(file, {
  folder: 'contracts',
  customFileName: 'user-contract',
});

// Upload video (automatically applies video validation)
const videoResult = await this.uploadsService.uploadVideo(file, {
  folder: 'tutorials',
  userId: 'user-123',
  makePublic: false, // Private video
});
```

## Advanced Usage

### 4. Custom File Validation

```typescript
const result = await this.uploadsService.uploadFile(file, {
  folder: 'custom',
  validation: {
    allowedMimeTypes: ['text/csv', 'application/json'],
    maxSize: 1024 * 1024, // 1MB
    minSize: 1024, // 1KB
  },
  cacheControl: 'private, max-age=3600', // 1 hour cache
});
```

### 5. Public vs Private Files

```typescript
// Public file (default)
const publicFile = await this.uploadsService.uploadFile(file, {
  folder: 'public-assets',
  makePublic: true, // default
});

// Private file
const privateFile = await this.uploadsService.uploadFile(file, {
  folder: 'private-documents',
  makePublic: false,
});
```

## API Endpoints

### Generic Upload Endpoint

```
POST /uploads/file
```

**Request Body (multipart/form-data):**
- `file`: The file to upload
- `options`: JSON object with upload configuration

**Example options:**
```json
{
  "folder": "documents",
  "userId": "user-123",
  "customFileName": "invoice-2025",
  "makePublic": true,
  "cacheControl": "public, max-age=31536000"
}
```

### Predefined File Type Endpoints

You can still use the convenience methods in your controllers:

```typescript
@Post('upload-image')
async uploadImage(@UploadedFile() file, @CurrentUser() user) {
  return this.uploadsService.uploadImage(file, {
    folder: 'user-images',
    userId: user.id,
  });
}
```

## File Type Configurations

The service includes predefined configurations for common file types:

### IMAGE
- **MIME Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Max Size:** 10MB

### DOCUMENT
- **MIME Types:** `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Max Size:** 20MB

### VIDEO
- **MIME Types:** `video/mp4`, `video/mpeg`, `video/quicktime`
- **Max Size:** 100MB

### AUDIO
- **MIME Types:** `audio/mpeg`, `audio/wav`, `audio/ogg`
- **Max Size:** 50MB

### ANY
- **MIME Types:** No restrictions
- **Max Size:** 100MB

## Migration from Old Service

### Before (Profile Picture Specific)
```typescript
const result = await this.uploadsService.uploadProfilePicture(file, userId);
```

### After (Generic)
```typescript
// Using the generic method
const result = await this.uploadsService.uploadFile(file, {
  folder: 'profiles',
  userId,
  validation: FILE_TYPE_CONFIGS[FileType.IMAGE],
});

// Or using the convenience method
const result = await this.uploadsService.uploadImage(file, {
  folder: 'profiles',
  userId,
});

// The old method still works (marked as deprecated)
const result = await this.uploadsService.uploadProfilePicture(file, userId);
```

## Error Handling

The service throws `BadRequestException` for validation errors:

- Invalid file type
- File too large/small
- Missing file
- Invalid options

Always wrap upload calls in try-catch blocks:

```typescript
try {
  const result = await this.uploadsService.uploadFile(file, options);
  return result;
} catch (error) {
  if (error instanceof BadRequestException) {
    throw error; // Client error
  }
  throw new InternalServerErrorException('Upload failed');
}
```
