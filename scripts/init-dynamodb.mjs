import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';

async function initializeDynamoDB() {
  const client = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local'
    }
  });

  try {
    console.log('🔄 Verificando tablas existentes...');
    
    const listTablesResponse = await client.send(new ListTablesCommand({}));
    console.log('📋 Tablas existentes:', listTablesResponse.TableNames);

    if (!listTablesResponse.TableNames?.includes('company-table')) {
      console.log('🔧 Creando tabla company-table...');
      
      await client.send(new CreateTableCommand({
        TableName: 'company-table',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S'
          },
          {
            AttributeName: 'identification',
            AttributeType: 'S'
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'identification-index',
            KeySchema: [
              {
                AttributeName: 'identification',
                KeyType: 'HASH'
              }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        ]
      }));
      
      console.log('✅ Tabla company-table creada exitosamente');
    } else {
      console.log('ℹ️  La tabla company-table ya existe');
    }

    // Verificar tablas finales
    const finalTablesResponse = await client.send(new ListTablesCommand({}));
    console.log('📋 Tablas finales:', finalTablesResponse.TableNames);
    
  } catch (error) {
    console.error('❌ Error inicializando DynamoDB:', error.message);
    process.exit(1);
  }
}

initializeDynamoDB();
