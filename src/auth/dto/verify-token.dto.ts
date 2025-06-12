import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty({
    description: 'Firebase ID token to verify',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
