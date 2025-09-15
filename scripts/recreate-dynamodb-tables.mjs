import { DynamoDBClient, CreateTableCommand, ListTablesCommand, DeleteTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

async function recreateDynamoDBTables() {
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

    // Eliminar tabla existente si existe
    if (listTablesResponse.TableNames?.includes('company-table')) {
      console.log('🗑️  Eliminando tabla company-table existente...');
      await client.send(new DeleteTableCommand({
        TableName: 'company-table'
      }));
      
      // Esperar a que la tabla se elimine completamente
      let tableExists = true;
      while (tableExists) {
        try {
          await client.send(new DescribeTableCommand({
            TableName: 'company-table'
          }));
          console.log('⏳ Esperando eliminación de tabla...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          if (error.name === 'ResourceNotFoundException') {
            tableExists = false;
          } else {
            throw error;
          }
        }
      }
      console.log('✅ Tabla eliminada exitosamente');
    }

    console.log('🔧 Creando tabla company-table con GSI...');
    
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
    
    console.log('✅ Tabla company-table creada exitosamente con GSI identification-index');

    // Verificar tablas finales
    const finalTablesResponse = await client.send(new ListTablesCommand({}));
    console.log('📋 Tablas finales:', finalTablesResponse.TableNames);
    
    // Verificar detalles de la tabla
    const tableDescription = await client.send(new DescribeTableCommand({
      TableName: 'company-table'
    }));
    
    console.log('📋 Índices disponibles:');
    if (tableDescription.Table?.GlobalSecondaryIndexes) {
      tableDescription.Table.GlobalSecondaryIndexes.forEach(gsi => {
        console.log(`  - ${gsi.IndexName}: ${gsi.KeySchema?.map(k => `${k.AttributeName} (${k.KeyType})`).join(', ')}`);
      });
    } else {
      console.log('  - Sin GSI configurados');
    }
    
  } catch (error) {
    console.error('❌ Error recreando tablas de DynamoDB:', error.message);
    process.exit(1);
  }
}

recreateDynamoDBTables();
