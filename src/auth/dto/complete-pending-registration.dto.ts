import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompletePendingRegistrationDto {
  @ApiProperty({
    description: 'Firebase ID token to verify',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyN...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Email address from the invitation',
    example: 'factory@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
