import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CompanyModule } from './modules/company/company.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './common/auth/auth.module';
import { DatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.staging', '.env.production', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
    }]),
    
    // PostgreSQL database connection
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    
    // Application modules
    CommonModule,
    AuthModule,
    CustomerModule,
    CompanyModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}