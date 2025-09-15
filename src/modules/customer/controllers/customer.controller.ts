import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully', type: Customer })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: CustomerStatus, description: 'Filter by status' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: CustomerStatus,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.customerService.findAll(pageNumber, limitNumber, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Get('identification/:identification')
  @ApiOperation({ summary: 'Get customer by identification number' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'identification', description: 'Customer identification number' })
  async findByIdentification(@Param('identification') identification: string): Promise<Customer> {
    return this.customerService.findByIdentification(identification);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete customer by ID' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.customerService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted customer' })
  @ApiResponse({ status: 200, description: 'Customer restored successfully', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  async restore(@Param('id') id: string): Promise<Customer> {
    return this.customerService.restore(id);
  }
}
