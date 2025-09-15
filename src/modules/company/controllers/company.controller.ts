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
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';
import { CompanyEntity, CompanyStatus } from '../entities/company.entity';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: CompanyEntity })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List companies with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'lastKey', required: false, type: String, description: 'Last evaluated key for pagination' })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus, description: 'Filter by status' })
  async findAll(
    @Query('limit') limit: string = '10',
    @Query('lastKey') lastKey?: string,
    @Query('status') status?: CompanyStatus,
  ) {
    const limitNumber = parseInt(limit, 10);
    const lastEvaluatedKey = lastKey ? JSON.parse(Buffer.from(lastKey, 'base64').toString()) : undefined;
    
    const result = await this.companyService.findAll(limitNumber, lastEvaluatedKey, status);
    
    return {
      ...result,
      nextKey: result.lastEvaluatedKey ? 
        Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64') : 
        undefined,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully', type: CompanyEntity })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async findOne(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.findOne(id);
  }

  @Get('identification/:identification')
  @ApiOperation({ summary: 'Get company by identification number' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully', type: CompanyEntity })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'identification', description: 'Company identification number' })
  async findByIdentification(@Param('identification') identification: string): Promise<CompanyEntity> {
    return this.companyService.findByIdentification(identification);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: CompanyEntity })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete company by ID' })
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted company' })
  @ApiResponse({ status: 200, description: 'Company restored successfully', type: CompanyEntity })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async restore(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.restore(id);
  }
}
