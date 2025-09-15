import { Injectable } from '@nestjs/common';
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

    return this.customerRepository.save(customer);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: CustomerStatus,
  ): Promise<{ customers: Customer[]; total: number; page: number; totalPages: number }> {
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
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, deletedAt: null as any },
    });
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  async findByIdentification(identification: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { identification, deletedAt: null as any },
    });
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    if (updateCustomerDto.identification) {
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

    return this.customerRepository.save(customer);
  }

  async softDelete(id: string): Promise<void> {
    const customer = await this.findOne(id);
    customer.softDelete();
    await this.customerRepository.save(customer);
  }

  async restore(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    customer.restore();
    return this.customerRepository.save(customer);
  }
}
