import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const requestId = uuidv4();
    
    // Add requestId to request for later use
    request.requestId = requestId;
    
    const startTime = Date.now();

    this.logger.log(`Incoming ${method} ${url}`, 'HTTP', {
      requestId,
      method,
      url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(`Completed ${method} ${url} - ${response.statusCode}`, 'HTTP', {
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration,
            responseSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`Failed ${method} ${url}`, error, 'HTTP', {
            requestId,
            method,
            url,
            duration,
            errorMessage: error.message,
            errorStack: error.stack,
          });
        },
      }),
    );
  }
}
