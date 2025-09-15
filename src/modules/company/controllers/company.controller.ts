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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';
import { CompanyEntity, CompanyStatus } from '../entities/company.entity';
import { ApiCrudController } from '../../../common/decorators/base-crud.decorator';
import { ApiCrudOperation, ApiFindByIdentification } from '../../../common/decorators/api-crud.decorator';

@ApiCrudController('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiCrudOperation('create', 'Company', CompanyEntity)
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiCrudOperation('findAll', 'Company', CompanyEntity)
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
  @ApiCrudOperation('findOne', 'Company', CompanyEntity)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async findOne(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.findOne(id);
  }

  @Get('identification/:identification')
  @ApiFindByIdentification('company', CompanyEntity)
  @ApiParam({ name: 'identification', description: 'Company identification number' })
  async findByIdentification(@Param('identification') identification: string): Promise<CompanyEntity> {
    return this.companyService.findByIdentification(identification);
  }

  @Put(':id')
  @ApiCrudOperation('update', 'Company', CompanyEntity)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiCrudOperation('delete', 'Company', CompanyEntity)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.softDelete(id);
  }

  @Patch(':id/restore')
  @ApiCrudOperation('restore', 'Company', CompanyEntity)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  async restore(@Param('id') id: string): Promise<CompanyEntity> {
    return this.companyService.restore(id);
  }
}
