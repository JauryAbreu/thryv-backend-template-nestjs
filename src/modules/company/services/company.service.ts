import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyEntity, CompanyStatus } from '../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyEntity> {
    try {
      // Verificar si ya existe una company con esa identificación
      const existingCompany = await this.companyRepository.findByIdentification(createCompanyDto.identification);
      
      if (existingCompany) {
        throw new BadRequestException(`Company with identification ${createCompanyDto.identification} already exists`);
      }

      return await this.companyRepository.create(createCompanyDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Manejar errores específicos de DynamoDB
      if (error.name === 'ConditionalCheckFailedException') {
        throw new BadRequestException(`Company with identification ${createCompanyDto.identification} already exists`);
      }
      
      throw new InternalServerErrorException(`Failed to create company: ${error.message}`);
    }
  }

  async findAll(
    limit: number = 10,
    lastEvaluatedKey?: any,
    status?: CompanyStatus,
  ): Promise<{ companies: CompanyEntity[]; lastEvaluatedKey?: any; count: number }> {
    try {
      return await this.companyRepository.findAll(limit, lastEvaluatedKey, status);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch companies: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<CompanyEntity> {
    try {
      const company = await this.companyRepository.findOne(id);
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch company: ${error.message}`);
    }
  }

  async findByIdentification(identification: string): Promise<CompanyEntity> {
    try {
      const company = await this.companyRepository.findByIdentification(identification);
      if (!company) {
        throw new NotFoundException(`Company with identification ${identification} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch company by identification: ${error.message}`);
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyEntity> {
    try {
      // Si se está actualizando la identificación, verificar que no exista ya en otra company
      if (updateCompanyDto.identification) {
        const existingCompany = await this.companyRepository.findByIdentification(updateCompanyDto.identification);
        
        if (existingCompany && existingCompany.id !== id) {
          throw new BadRequestException(`Company with identification ${updateCompanyDto.identification} already exists`);
        }
      }

      const company = await this.companyRepository.update(id, updateCompanyDto);
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Manejar errores específicos de DynamoDB
      if (error.name === 'ConditionalCheckFailedException') {
        throw new BadRequestException(`Company with identification ${updateCompanyDto.identification} already exists`);
      }
      
      throw new InternalServerErrorException(`Failed to update company: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<void> {
    try {
      const success = await this.companyRepository.softDelete(id);
      if (!success) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete company: ${error.message}`);
    }
  }

  async restore(id: string): Promise<CompanyEntity> {
    try {
      const company = await this.companyRepository.restore(id);
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to restore company: ${error.message}`);
    }
  }
}
