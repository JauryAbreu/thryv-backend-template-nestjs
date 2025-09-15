import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { CustomerModule } from '../customer/customer.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [CustomerModule, CompanyModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
