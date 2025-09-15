import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Decorador para configurar un controller CRUD completo
export function ApiCrudController(tag: string, useAuth: boolean = true) {
  const decorators = [
    ApiTags(tag)
  ];

  if (useAuth) {
    decorators.push(
      ApiBearerAuth(),
      UseGuards(JwtAuthGuard)
    );
  }

  return applyDecorators(...decorators);
}

// Clase base abstracta para controllers CRUD
export abstract class BaseCrudController<Entity, CreateDto, UpdateDto> {
  constructor(protected readonly service: any) {}

  abstract create(createDto: CreateDto): Promise<Entity>;
  abstract findAll(page?: number, limit?: number, status?: string): Promise<any>;
  abstract findOne(id: string): Promise<Entity>;
  abstract findByIdentification?(identification: string): Promise<Entity>;
  abstract update(id: string, updateDto: UpdateDto): Promise<Entity>;
  abstract remove(id: string): Promise<void>;
  abstract restore?(id: string): Promise<Entity>;
}
