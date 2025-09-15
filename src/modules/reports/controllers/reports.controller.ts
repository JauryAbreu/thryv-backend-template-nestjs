import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { RolesGuard, RequireRoles } from '../../../common/auth/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('customers')
  @RequireRoles(['admin', 'analyst'])
  @ApiOperation({ summary: 'Get customer analytics report' })
  @ApiResponse({ status: 200, description: 'Customer report generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (ISO 8601)' })
  async getCustomerReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getCustomerReport(dateFrom, dateTo);
  }

  @Get('companies')
  @RequireRoles(['admin', 'analyst'])
  @ApiOperation({ summary: 'Get company analytics report' })
  @ApiResponse({ status: 200, description: 'Company report generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (ISO 8601)' })
  async getCompanyReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getCompanyReport(dateFrom, dateTo);
  }

  @Get('dashboard')
  @RequireRoles(['admin', 'analyst', 'manager'])
  @ApiOperation({ summary: 'Get combined analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getDashboard() {
    return this.reportsService.getCombinedDashboard();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check reports service health and Cube connectivity' })
  @ApiResponse({ status: 200, description: 'Service health check' })
  async getHealth() {
    const cubeConfigured = !!(process.env.CUBE_API_URL && process.env.CUBE_API_TOKEN);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      cubeCloud: {
        configured: cubeConfigured,
        url: process.env.CUBE_API_URL ? 'configured' : 'not configured',
      },
    };
  }
}
