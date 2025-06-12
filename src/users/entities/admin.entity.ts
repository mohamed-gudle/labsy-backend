import {
  Entity,
  Column,
  ChildEntity,
} from 'typeorm';
import { User } from './user.entity';

@Entity('admins')
@ChildEntity()
export class Admin extends User {
  @Column({ name: 'employee_id', unique: true })
  employeeId: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  phone?: string;

  // Admin permissions and roles
  @Column({
    name: 'permissions',
    type: 'simple-array',
    default: '',
  })
  permissions: string[];

  // Admin level/hierarchy
  @Column({
    name: 'admin_level',
    type: 'enum',
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'support',
  })
  adminLevel: 'super_admin' | 'admin' | 'moderator' | 'support';

  // Two-factor authentication settings
  @Column({
    name: 'two_factor_enabled',
    default: false,
  })
  twoFactorEnabled: boolean;

  @Column({
    name: 'two_factor_secret',
    nullable: true,
  })
  twoFactorSecret?: string;

  // Admin settings and preferences
  @Column({
    name: 'admin_settings',
    type: 'jsonb',
    default: () => "'{}'",
  })
  adminSettings: AdminSettings;

  // Last active tracking
  @Column({
    name: 'last_active_at',
    nullable: true,
  })
  lastActiveAt?: Date;

  // IP restrictions
  @Column({
    name: 'allowed_ips',
    type: 'simple-array',
    nullable: true,
  })
  allowedIps?: string[];

  // Session management
  @Column({
    name: 'session_timeout',
    type: 'int',
    default: 3600, // 1 hour in seconds
  })
  sessionTimeout: number;
}

export interface AdminSettings {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  timezone: string;
  notificationPreferences: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
  };
  dashboardLayout?: {
    widgets: string[];
    layout: 'grid' | 'list';
  };
}
