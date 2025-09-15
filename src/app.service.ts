import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thryv-backend-nestjs',
    };
  }

  getDetailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thryv-backend-nestjs',
      version: process.env.DD_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      databases: {
        postgresql: 'connected', // TODO: Add actual health check
        dynamodb: 'connected',   // TODO: Add actual health check
      },
    };
  }
}
