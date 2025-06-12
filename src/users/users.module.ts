import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Customer, Creator, Factory, Admin } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer, Creator, Factory, Admin]),
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
