import { IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyStatus } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company identification number', maxLength: 25 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  identification: string;

  @ApiProperty({ description: 'Company name', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Company alias', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  alias: string;

  @ApiProperty({ description: 'Company address', maxLength: 250 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  address: string;

  @ApiProperty({ description: 'Company status', enum: CompanyStatus, required: false })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}

export class UpdateCompanyDto {
  @ApiProperty({ description: 'Company identification number', maxLength: 25, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  identification?: string;

  @ApiProperty({ description: 'Company name', maxLength: 50, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: 'Company alias', maxLength: 100, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @ApiProperty({ description: 'Company address', maxLength: 250, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @ApiProperty({ description: 'Company status', enum: CompanyStatus, required: false })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}
