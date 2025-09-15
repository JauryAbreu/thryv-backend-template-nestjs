import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthTokenController } from './auth-token.controller';
import { AuthTokenService } from './auth-token.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthTokenController],
  providers: [AuthTokenService],
  exports: [AuthTokenService],
})
export class AuthTokenModule {}
