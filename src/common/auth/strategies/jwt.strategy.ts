import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.AUTH0_JWKS_URI || `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.JWT_ISSUER || process.env.AUTH0_DOMAIN,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any) {
    // Here you can add custom validation logic
    // The payload contains the decoded JWT claims
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload[process.env.AUTH0_ROLES_CLAIM || 'roles'] || [],
      permissions: payload.permissions || [],
      ...payload,
    };
  }
}
