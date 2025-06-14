import { PartialType } from '@nestjs/swagger';
import { CreateBaseProductDto } from './create-base-product.dto';

export class UpdateBaseProductDto extends PartialType(CreateBaseProductDto) {}
