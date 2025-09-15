import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

export enum CompanyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

export interface Company {
  id: string;
  identification: string;
  name: string;
  alias: string;
  address: string;
  createDate: string; // ISO 8601 string
  updateDate: string; // ISO 8601 string
  status: CompanyStatus;
  deletedAt?: string; // ISO 8601 string for soft delete
}

export class CompanyEntity implements Company {
  @ApiProperty({ description: 'Company unique identifier' })
  id: string;

  @ApiProperty({ description: 'Company identification number', maxLength: 25 })
  identification: string;

  @ApiProperty({ description: 'Company name', maxLength: 50 })
  name: string;

  @ApiProperty({ description: 'Company alias', maxLength: 100 })
  alias: string;

  @ApiProperty({ description: 'Company address', maxLength: 250 })
  address: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createDate: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updateDate: string;

  @ApiProperty({ description: 'Company status', enum: CompanyStatus })
  status: CompanyStatus;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: string;

  constructor(data: Partial<Company> = {}) {
    this.id = data.id || '';
    this.identification = data.identification || '';
    this.name = data.name || '';
    this.alias = data.alias || '';
    this.address = data.address || '';
    this.createDate = data.createDate || new Date().toISOString();
    this.updateDate = data.updateDate || new Date().toISOString();
    this.status = data.status || CompanyStatus.PENDING;
    this.deletedAt = data.deletedAt;
  }

  // Domain validation methods
  validateIdentification(): void {
    if (!this.identification || this.identification.length === 0) {
      throw new BadRequestException('Identification is required');
    }
    if (this.identification.length > 25) {
      throw new BadRequestException('Identification must not exceed 25 characters');
    }
  }

  validateName(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new BadRequestException('Name is required');
    }
    if (this.name.length > 50) {
      throw new BadRequestException('Name must not exceed 50 characters');
    }
  }

  validateAlias(): void {
    if (!this.alias || this.alias.trim().length === 0) {
      throw new BadRequestException('Alias is required');
    }
    if (this.alias.length > 100) {
      throw new BadRequestException('Alias must not exceed 100 characters');
    }
  }

  validateAddress(): void {
    if (!this.address || this.address.trim().length === 0) {
      throw new BadRequestException('Address is required');
    }
    if (this.address.length > 250) {
      throw new BadRequestException('Address must not exceed 250 characters');
    }
  }

  softDelete(): void {
    this.deletedAt = new Date().toISOString();
    this.status = CompanyStatus.INACTIVE;
    this.updateDate = new Date().toISOString();
  }

  restore(): void {
    this.deletedAt = undefined;
    this.status = CompanyStatus.ACTIVE;
    this.updateDate = new Date().toISOString();
  }

  update(data: Partial<Company>): void {
    if (data.identification !== undefined) {
      this.identification = data.identification;
      this.validateIdentification();
    }
    if (data.name !== undefined) {
      this.name = data.name;
      this.validateName();
    }
    if (data.alias !== undefined) {
      this.alias = data.alias;
      this.validateAlias();
    }
    if (data.address !== undefined) {
      this.address = data.address;
      this.validateAddress();
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    this.updateDate = new Date().toISOString();
  }
}
