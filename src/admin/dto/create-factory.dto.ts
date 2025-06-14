import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class FactoryCapabilitiesDto {
  @ApiPropertyOptional({
    description: 'Maximum production capacity per day',
    example: 1000,
  })
  @IsOptional()
  maxCapacityPerDay?: number;

  @ApiPropertyOptional({
    description: 'Available print methods',
    example: ['screen-printing', 'dtg', 'embroidery'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  printMethods?: string[];

  @ApiPropertyOptional({
    description: 'Supported material types',
    example: ['cotton', 'polyester', 'canvas'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialTypes?: string[];

  @ApiPropertyOptional({
    description: 'Available product categories',
    example: ['t-shirts', 'hoodies', 'mugs', 'posters'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productCategories?: string[];
}

class FactoryLocationDto {
  @ApiProperty({
    description: 'Factory city',
    example: 'Riyadh',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Factory region/state',
    example: 'Riyadh Region',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  region: string;

  @ApiProperty({
    description: 'Country code',
    example: 'SA',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(3)
  country: string;

  @ApiPropertyOptional({
    description: 'Full address',
    example: 'Industrial District, Block 5, Building 123, Riyadh',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fullAddress?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}

export class CreateFactoryDto {
  @ApiProperty({
    description: 'Factory name',
    example: 'Riyadh Print Factory',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Factory email address',
    example: 'factory@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Factory business name',
    example: 'Al-Riyadh Printing Solutions LLC',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName: string;

  @ApiPropertyOptional({
    description: 'Factory contact phone number',
    example: '+966501234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Factory business description',
    example:
      'Leading printing factory in Riyadh specializing in custom merchandise',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessDescription?: string;

  @ApiProperty({
    description: 'Factory location information',
    type: FactoryLocationDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => FactoryLocationDto)
  location: FactoryLocationDto;

  @ApiPropertyOptional({
    description: 'Factory capabilities and specifications',
    type: FactoryCapabilitiesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FactoryCapabilitiesDto)
  capabilities?: FactoryCapabilitiesDto;

  @ApiPropertyOptional({
    description: 'Business registration number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  businessRegistrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number',
    example: '300123456789003',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;
}
