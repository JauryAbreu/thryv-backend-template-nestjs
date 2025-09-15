import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthTokenService, Auth0TokenResponse } from './auth-token.service';
import { GetTokenDto } from './dto/get-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthTokenController {
  constructor(private readonly authTokenService: AuthTokenService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get JWT Token from Auth0',
    description: 'Obtiene un token JWT de Auth0 usando Client Credentials flow para testing de la API'
  })
  @ApiResponse({
    status: 200,
    description: 'Token obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token'
        },
        token_type: {
          type: 'string',
          example: 'Bearer'
        },
        expires_in: {
          type: 'number',
          example: 86400,
          description: 'Token expiration time in seconds'
        },
        scope: {
          type: 'string',
          description: 'Granted scopes'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Error en las credenciales o configuración'
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor'
  })
  @ApiBody({
    type: GetTokenDto,
    description: 'Credenciales de Auth0 (opcional - usa variables de entorno si no se proporcionan)',
    required: false
  })
  async getToken(@Body() getTokenDto?: GetTokenDto): Promise<Auth0TokenResponse> {
    return this.authTokenService.getAuthToken(getTokenDto);
  }
}
