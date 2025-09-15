import { Injectable } from '@nestjs/common';
import { CustomerService } from '../../customer/services/customer.service';
import { CompanyService } from '../../company/services/company.service';
import axios from 'axios';

@Injectable()
export class ReportsService {
  private readonly cubeApiUrl: string;
  private readonly cubeApiToken: string;

  constructor(
    private readonly customerService: CustomerService,
    private readonly companyService: CompanyService,
  ) {
    this.cubeApiUrl = process.env.CUBE_API_URL || '';
    this.cubeApiToken = process.env.CUBE_API_TOKEN || '';
  }

  async getCustomerReport(dateFrom?: string, dateTo?: string) {
    // Get aggregated customer data
    const customers = await this.customerService.findAll(1000); // Large limit for reporting
    
    const aggregatedData = {
      totalCustomers: customers.total,
      byStatus: this.aggregateByField(customers.customers, 'status'),
      byGender: this.aggregateByField(customers.customers, 'gender'),
      byMonth: this.aggregateByMonth(customers.customers, 'createDate'),
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    };

    // Send to Cube Cloud for further processing if configured
    if (this.cubeApiUrl && this.cubeApiToken) {
      try {
        await this.sendToCube('customers', aggregatedData);
      } catch (error) {
        console.error('Failed to send customer data to Cube:', error.message);
      }
    }

    return aggregatedData;
  }

  async getCompanyReport(dateFrom?: string, dateTo?: string) {
    // Get aggregated company data
    const companies = await this.companyService.findAll(1000); // Large limit for reporting
    
    const aggregatedData = {
      totalCompanies: companies.count,
      byStatus: this.aggregateByField(companies.companies, 'status'),
      byMonth: this.aggregateByMonth(companies.companies, 'createDate'),
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    };

    // Send to Cube Cloud for further processing if configured
    if (this.cubeApiUrl && this.cubeApiToken) {
      try {
        await this.sendToCube('companies', aggregatedData);
      } catch (error) {
        console.error('Failed to send company data to Cube:', error.message);
      }
    }

    return aggregatedData;
  }

  async getCombinedDashboard() {
    const [customerReport, companyReport] = await Promise.all([
      this.getCustomerReport(),
      this.getCompanyReport(),
    ]);

    const dashboard = {
      summary: {
        totalCustomers: customerReport.totalCustomers,
        totalCompanies: companyReport.totalCompanies,
        timestamp: new Date().toISOString(),
      },
      customers: customerReport,
      companies: companyReport,
    };

    // Send combined dashboard to Cube for analytics
    if (this.cubeApiUrl && this.cubeApiToken) {
      try {
        await this.sendToCube('dashboard', dashboard);
      } catch (error) {
        console.error('Failed to send dashboard data to Cube:', error.message);
      }
    }

    return dashboard;
  }

  private aggregateByField(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private aggregateByMonth(items: any[], dateField: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});
  }

  private async sendToCube(dataType: string, data: any): Promise<void> {
    const payload = {
      query: {
        measures: [`${dataType}.count`],
        timeDimensions: [
          {
            dimension: `${dataType}.createDate`,
            granularity: 'month',
          },
        ],
        dimensions: [`${dataType}.status`],
      },
      metadata: data,
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(
      `${this.cubeApiUrl}/v1/load`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.cubeApiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      },
    );

    if (response.status !== 200) {
      throw new Error(`Cube API returned ${response.status}: ${response.statusText}`);
    }
  }
}
