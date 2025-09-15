import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTokenDto {
  @ApiProperty({
    description: 'Auth0 Domain',
    example: 'dev-example.us.auth0.com',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  domain?: string;

  @ApiProperty({
    description: 'Auth0 Client ID',
    example: 'your-client-id',
    required: false
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({
    description: 'Auth0 Client Secret',
    example: 'your-client-secret',
    required: false
  })
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiProperty({
    description: 'Auth0 Audience',
    example: 'https://your-api-identifier',
    required: false
  })
  @IsOptional()
  @IsString()
  audience?: string;
}
