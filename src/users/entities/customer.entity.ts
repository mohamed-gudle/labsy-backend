import { Column, ChildEntity } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../enums';

@ChildEntity(UserRole.CUSTOMER)
export class Customer extends User {
  @Column({ nullable: true })
  phone?: string;

  @Column({
    name: 'preferred_language',
    default: 'ar',
    enum: ['ar', 'en'],
  })
  preferredLanguage: 'ar' | 'en';

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  gender?: string;

  // Shipping addresses stored as JSON
  @Column({
    name: 'shipping_addresses',
    type: 'jsonb',
    nullable: true,
  })
  shippingAddresses?: ShippingAddress[];

  // Customer preferences
  @Column({
    name: 'marketing_preferences',
    type: 'jsonb',
    default: () => "'{}'",
  })
  marketingPreferences: MarketingPreferences;

  // Profile completion percentage
  @Column({
    name: 'profile_completion_percentage',
    type: 'int',
    default: 0,
  })
  profileCompletionPercentage: number;
}

export interface ShippingAddress {
  id: string;
  label: string; // e.g., 'Home', 'Work'
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface MarketingPreferences {
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushNotifications: boolean;
  productRecommendations: boolean;
}
