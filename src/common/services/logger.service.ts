import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as CloudWatchTransport from 'winston-cloudwatch';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    ];

    // Add CloudWatch transport in production or when configured
    if (process.env.AWS_CLOUDWATCH_LOG_GROUP) {
      transports.push(
        new CloudWatchTransport({
          logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP,
          logStreamName: process.env.AWS_CLOUDWATCH_LOG_STREAM || `${Date.now()}`,
          awsRegion: process.env.AWS_REGION || 'us-east-1',
          messageFormatter: ({ level, message, additionalInfo }: { level: string; message: string; additionalInfo?: any }) => 
            JSON.stringify({ level, message, ...additionalInfo }),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: process.env.DD_SERVICE || 'thryv-backend',
        environment: process.env.DD_ENV || 'development',
      },
      transports,
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, error?: any, context?: string, meta?: any) {
    this.logger.error(message, { 
      context, 
      error: error?.message || error, 
      stack: error?.stack, 
      ...meta 
    });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }
}
