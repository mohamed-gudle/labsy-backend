import { ApiProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiProperty({
    description: 'Public URL of the uploaded file',
    example:
      'https://storage.googleapis.com/labsy-uploads/profiles/user-123/uuid.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Filename in the storage bucket',
    example: 'profiles/user-123/uuid.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Storage bucket name',
    example: 'labsy-uploads',
  })
  bucket: string;
}
