import { Column, ChildEntity } from 'typeorm';
import { User } from './user.entity';

@ChildEntity()
export class Factory extends User {
  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_description', type: 'text', nullable: true })
  companyDescription?: string;

  @Column({ name: 'contact_person' })
  contactPerson: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'business_license' })
  businessLicense: string;

  @Column({ name: 'tax_id' })
  taxId: string;

  // Factory location/address
  @Column({
    name: 'location',
    type: 'jsonb',
  })
  location: FactoryLocation;

  // Manufacturing capabilities
  @Column({
    name: 'capabilities',
    type: 'jsonb',
  })
  capabilities: ManufacturingCapabilities;

  // Operational details
  @Column({
    name: 'operational_details',
    type: 'jsonb',
    default: () => "'{}'",
  })
  operationalDetails: OperationalDetails;

  // Quality certifications
  @Column({
    name: 'certifications',
    type: 'simple-array',
    nullable: true,
  })
  certifications?: string[];

  // Minimum order quantities
  @Column({
    name: 'minimum_order_quantities',
    type: 'jsonb',
    nullable: true,
  })
  minimumOrderQuantities?: MinimumOrderQuantities;

  // Production capacity
  @Column({
    name: 'production_capacity',
    type: 'jsonb',
    nullable: true,
  })
  productionCapacity?: ProductionCapacity;

  // Verification status
  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  verificationStatus: 'pending' | 'verified' | 'rejected';

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt?: Date;

  // Partnership terms
  @Column({
    name: 'partnership_terms',
    type: 'jsonb',
    nullable: true,
  })
  partnershipTerms?: PartnershipTerms;
}

export interface FactoryLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ManufacturingCapabilities {
  printingMethods: string[]; // e.g., ['screen_printing', 'digital_printing', 'embroidery']
  productTypes: string[]; // e.g., ['t_shirts', 'hoodies', 'mugs', 'stickers']
  materials: string[]; // e.g., ['cotton', 'polyester', 'canvas']
  colors: string[]; // Available colors for printing
  finishingOptions: string[]; // e.g., ['heat_press', 'vinyl_cutting']
}

export interface OperationalDetails {
  workingHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  leadTime: {
    standard: number; // days
    rush: number; // days
  };
  shippingMethods: string[];
  acceptsRushOrders: boolean;
}

export interface MinimumOrderQuantities {
  [productType: string]: number;
}

export interface ProductionCapacity {
  dailyCapacity: number;
  monthlyCapacity: number;
  peakSeasonCapacity?: number;
}

export interface PartnershipTerms {
  commissionRate: number; // percentage
  paymentTerms: string; // e.g., "Net 30", "COD"
  exclusivityAgreements?: string[];
  qualityStandards: string;
}
