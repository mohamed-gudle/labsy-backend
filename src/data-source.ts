import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Admin } from './users/entities/admin.entity';
import { Creator } from './users/entities/creator.entity';
import { Customer } from './users/entities/customer.entity';
import { Factory } from './users/entities/factory.entity';
// Add other entities as needed

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USERNAME ?? 'admin',
  password: process.env.DATABASE_PASSWORD ?? 'secret',
  database: process.env.DATABASE_DATABASE ?? 'labsydb',
  entities: [User, Admin, Creator, Customer, Factory],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // Always false in production
});
