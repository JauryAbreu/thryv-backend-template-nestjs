#!/bin/bash

# Script para crear las tablas de DynamoDB Local

echo "Creando tabla company-table en DynamoDB Local..."

# Crear tabla de companies
aws dynamodb create-table \
    --table-name company-table \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url http://localhost:8000 \
    --region us-east-1 \
    --no-cli-pager \
    || echo "La tabla company-table ya existe o hubo un error al crearla"

echo "Verificando tablas existentes..."
aws dynamodb list-tables \
    --endpoint-url http://localhost:8000 \
    --region us-east-1 \
    --no-cli-pager

echo "¡Tablas de DynamoDB creadas exitosamente!"
