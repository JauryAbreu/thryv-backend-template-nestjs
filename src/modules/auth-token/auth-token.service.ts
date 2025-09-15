import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetTokenDto } from './dto/get-token.dto';
import * as https from 'https';
import * as querystring from 'querystring';

export interface Auth0TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly configService: ConfigService) {}

  async getAuthToken(getTokenDto?: GetTokenDto): Promise<Auth0TokenResponse> {
    // Usar credenciales del DTO o variables de entorno como fallback
    const domain = getTokenDto?.domain || this.configService.get<string>('AUTH0_DOMAIN');
    const clientId = getTokenDto?.clientId || this.configService.get<string>('AUTH0_CLIENT_ID');
    const clientSecret = getTokenDto?.clientSecret || this.configService.get<string>('AUTH0_CLIENT_SECRET');
    const audience = getTokenDto?.audience || this.configService.get<string>('AUTH0_AUDIENCE');

    // Validar que tenemos todas las credenciales necesarias
    if (!domain || !clientId || !clientSecret || !audience) {
      throw new BadRequestException(
        'Credenciales de Auth0 faltantes. Proporciona domain, clientId, clientSecret y audience ' +
        'en el body de la petición o configúralos en las variables de entorno.'
      );
    }

    const tokenUrl = `https://${domain}/oauth/token`;
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
    });

    try {
      const response = await this.makeHttpsRequest(tokenUrl, postData);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error obteniendo token de Auth0:', error);
      throw new ServiceUnavailableException(
        `Error comunicándose con Auth0: ${error.message}`
      );
    }
  }

  private makeHttpsRequest(url: string, postData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode || 'Unknown'}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}
