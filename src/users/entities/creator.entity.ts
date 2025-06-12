import { Entity, Column, ChildEntity } from 'typeorm';
import { User } from './user.entity';

@Entity('creators')
@ChildEntity()
export class Creator extends User {
  @Column({ name: 'business_name', nullable: true })
  businessName?: string;

  @Column({ name: 'business_description', type: 'text', nullable: true })
  businessDescription?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'business_license', nullable: true })
  businessLicense?: string;

  @Column({ name: 'tax_id', nullable: true })
  taxId?: string;

  // Social media links stored as JSON
  @Column({
    name: 'social_media_links',
    type: 'jsonb',
    nullable: true,
  })
  socialMediaLinks?: SocialMediaLinks;

  // Business address
  @Column({
    name: 'business_address',
    type: 'jsonb',
    nullable: true,
  })
  businessAddress?: BusinessAddress;

  // Creator categories/specialties
  @Column({
    name: 'categories',
    type: 'simple-array',
    nullable: true,
  })
  categories?: string[];

  // Bank account information for payments
  @Column({
    name: 'bank_account_info',
    type: 'jsonb',
    nullable: true,
  })
  bankAccountInfo?: BankAccountInfo;

  // Profile completion percentage
  @Column({
    name: 'profile_completion_percentage',
    type: 'int',
    default: 0,
  })
  profileCompletionPercentage: number;

  // Store/brand settings
  @Column({
    name: 'store_settings',
    type: 'jsonb',
    default: () => "'{}'",
  })
  storeSettings: StoreSettings;

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
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

export interface BusinessAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  accountHolderName: string;
}

export interface StoreSettings {
  storeName?: string;
  storeDescription?: string;
  logo?: string;
  coverImage?: string;
  isActive: boolean;
  acceptsCustomOrders: boolean;
  minimumOrderAmount?: number;
}
