import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';

import { initializeTracing } from './config/tracing.config';
import helmet from 'helmet';
import * as compression from 'compression';
import express from 'express';

let server: any;

async function createServer() {
  if (server) {
    return server;
  }

  // Initialize tracing
  initializeTracing();

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global interceptors will be handled by APP_INTERCEPTOR provider in AppModule

  // Enable CORS for Lambda
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();

  server = serverlessExpress({ app: expressApp });
  return server;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const server = await createServer();
  return server(event, context);
};
