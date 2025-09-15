import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      // Verificar si ya existe un customer con esa identificación
      const existingCustomer = await this.customerRepository.findOne({
        where: { 
          identification: createCustomerDto.identification,
          deletedAt: null as any 
        },
      });

      if (existingCustomer) {
        throw new BadRequestException(`Customer with identification ${createCustomerDto.identification} already exists`);
      }

      // Validate domain invariants
      const customer = new Customer();
      customer.identification = createCustomerDto.identification;
      customer.name = createCustomerDto.name;
      customer.lastname = createCustomerDto.lastname;
      customer.dateBorn = new Date(createCustomerDto.dateBorn);
      customer.gender = createCustomerDto.gender;
      customer.status = createCustomerDto.status || CustomerStatus.PENDING;

      // Apply domain validation
      customer.validateIdentification();
      customer.validateName();
      customer.validateLastname();

      return await this.customerRepository.save(customer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Manejar error específico de constraint violation
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(`Customer with identification ${createCustomerDto.identification} already exists`);
      }
      
      throw new InternalServerErrorException(`Failed to create customer: ${error.message}`);
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: CustomerStatus,
  ): Promise<{ customers: Customer[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: FindOptionsWhere<Customer> = { deletedAt: null as any };
      if (status) {
        where.status = status;
      }

      const [customers, total] = await this.customerRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { createDate: 'DESC' },
      });

      return {
        customers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to fetch customers: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id, deletedAt: null as any },
      });
      
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch customer: ${error.message}`);
    }
  }

  async findByIdentification(identification: string): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { identification, deletedAt: null as any },
      });
      
      if (!customer) {
        throw new NotFoundException(`Customer with identification ${identification} not found`);
      }
      
      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch customer by identification: ${error.message}`);
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    try {
      const customer = await this.findOne(id);
      
      // Si se está actualizando la identificación, verificar que no exista ya en otro customer
      if (updateCustomerDto.identification && updateCustomerDto.identification !== customer.identification) {
        const existingCustomer = await this.customerRepository.findOne({
          where: { 
            identification: updateCustomerDto.identification,
            deletedAt: null as any 
          },
        });

        if (existingCustomer) {
          throw new BadRequestException(`Customer with identification ${updateCustomerDto.identification} already exists`);
        }
        
        customer.identification = updateCustomerDto.identification;
        customer.validateIdentification();
      }
      
      if (updateCustomerDto.name) {
        customer.name = updateCustomerDto.name;
        customer.validateName();
      }
      if (updateCustomerDto.lastname) {
        customer.lastname = updateCustomerDto.lastname;
        customer.validateLastname();
      }
      if (updateCustomerDto.dateBorn) {
        customer.dateBorn = new Date(updateCustomerDto.dateBorn);
      }
      if (updateCustomerDto.gender) {
        customer.gender = updateCustomerDto.gender;
      }
      if (updateCustomerDto.status) {
        customer.status = updateCustomerDto.status;
      }

      return await this.customerRepository.save(customer);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Manejar error específico de constraint violation
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new BadRequestException(`Customer with identification ${updateCustomerDto.identification} already exists`);
      }
      
      throw new InternalServerErrorException(`Failed to update customer: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<void> {
    try {
      const customer = await this.findOne(id);
      customer.softDelete();
      await this.customerRepository.save(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete customer: ${error.message}`);
    }
  }

  async restore(id: string): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id },
        withDeleted: true,
      });
      
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      
      customer.restore();
      return await this.customerRepository.save(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to restore customer: ${error.message}`);
    }
  }
}
