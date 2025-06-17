import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  UploadsController,
  ProfileUploadsController,
} from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [UploadsController, ProfileUploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
