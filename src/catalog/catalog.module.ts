import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { BaseProduct, PrintableArea } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([BaseProduct, PrintableArea])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
