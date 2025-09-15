import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyEntity, CompanyStatus } from '../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companyRepository.create(createCompanyDto);
  }

  async findAll(
    limit: number = 10,
    lastEvaluatedKey?: any,
    status?: CompanyStatus,
  ): Promise<{ companies: CompanyEntity[]; lastEvaluatedKey?: any; count: number }> {
    return this.companyRepository.findAll(limit, lastEvaluatedKey, status);
  }

  async findOne(id: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async findByIdentification(identification: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findByIdentification(identification);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyEntity> {
    const company = await this.companyRepository.update(id, updateCompanyDto);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async softDelete(id: string): Promise<void> {
    const success = await this.companyRepository.softDelete(id);
    if (!success) {
      throw new Error('Company not found');
    }
  }

  async restore(id: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.restore(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }
}
