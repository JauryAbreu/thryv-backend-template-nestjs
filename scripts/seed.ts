import { DataSource } from 'typeorm';
import { Customer, CustomerGender, CustomerStatus } from '../src/modules/customer/entities/customer.entity';
import { 
  DynamoDBClient, 
  CreateTableCommand,
  PutItemCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CompanyEntity, CompanyStatus } from '../src/modules/company/entities/company.entity';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

async function seedPostgreSQL() {
  console.log('🌱 Seeding PostgreSQL database...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Customer],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to PostgreSQL');

    const customerRepository = dataSource.getRepository(Customer);

    // Clear existing data
    await customerRepository.clear();

    // Sample customers
    const customers = [
      {
        identification: '12345678901',
        name: 'John',
        lastname: 'Doe',
        dateBorn: new Date('1990-01-15'),
        gender: CustomerGender.MALE,
        status: CustomerStatus.ACTIVE,
      },
      {
        identification: '23456789012',
        name: 'Jane',
        lastname: 'Smith',
        dateBorn: new Date('1985-03-20'),
        gender: CustomerGender.FEMALE,
        status: CustomerStatus.ACTIVE,
      },
      {
        identification: '34567890123',
        name: 'Bob',
        lastname: 'Johnson',
        dateBorn: new Date('1992-07-10'),
        gender: CustomerGender.MALE,
        status: CustomerStatus.PENDING,
      },
      {
        identification: '45678901234',
        name: 'Alice',
        lastname: 'Williams',
        dateBorn: new Date('1988-12-05'),
        gender: CustomerGender.FEMALE,
        status: CustomerStatus.ACTIVE,
      },
      {
        identification: '56789012345',
        name: 'Charlie',
        lastname: 'Brown',
        dateBorn: new Date('1995-09-30'),
        gender: CustomerGender.OTHER,
        status: CustomerStatus.INACTIVE,
      },
    ];

    for (const customerData of customers) {
      const customer = customerRepository.create(customerData);
      await customerRepository.save(customer);
    }

    console.log(`✅ Seeded ${customers.length} customers in PostgreSQL`);
  } catch (error) {
    console.error('❌ PostgreSQL seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function seedDynamoDB() {
  console.log('🌱 Seeding DynamoDB...');

  const region = process.env.DYNAMODB_REGION || 'us-east-1';
  const endpoint = process.env.DYNAMODB_ENDPOINT; // For local development
  const tableName = process.env.DYNAMODB_TABLE_COMPANY || 'company-table';

  const dynamoClient = new DynamoDBClient({
    region,
    ...(endpoint && { endpoint }),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
    },
  });

  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  try {
    // Check if table exists, create if it doesn't
    const listTablesCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listTablesCommand);

    if (!tables.TableNames?.includes(tableName)) {
      console.log(`📝 Creating table: ${tableName}`);
      
      const createTableCommand = new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'identification', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'identification-index',
            KeySchema: [
              { AttributeName: 'identification', KeyType: 'HASH' }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      });

      await dynamoClient.send(createTableCommand);
      console.log(`✅ Table ${tableName} created`);

      // Wait a bit for table to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Sample companies
    const companies = [
      {
        id: uuidv4(),
        identification: 'COMP001',
        name: 'Tech Solutions Inc',
        alias: 'TechSol',
        address: '123 Innovation Drive, Tech City, TC 12345',
        status: CompanyStatus.ACTIVE,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        identification: 'COMP002',
        name: 'Global Services Ltd',
        alias: 'GlobalServ',
        address: '456 Business Avenue, Commerce City, CC 67890',
        status: CompanyStatus.ACTIVE,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        identification: 'COMP003',
        name: 'Startup Ventures',
        alias: 'StartupVent',
        address: '789 Entrepreneur Street, Innovation Hub, IH 11111',
        status: CompanyStatus.PENDING,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        identification: 'COMP004',
        name: 'Enterprise Corp',
        alias: 'EntCorp',
        address: '321 Corporate Plaza, Business District, BD 22222',
        status: CompanyStatus.ACTIVE,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        identification: 'COMP005',
        name: 'Legacy Systems',
        alias: 'LegacySys',
        address: '654 Old Technology Road, Vintage City, VC 33333',
        status: CompanyStatus.INACTIVE,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
    ];

    for (const company of companies) {
      const putCommand = new PutCommand({
        TableName: tableName,
        Item: company,
      });
      await docClient.send(putCommand);
    }

    console.log(`✅ Seeded ${companies.length} companies in DynamoDB`);
  } catch (error) {
    console.error('❌ DynamoDB seeding failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database seeding process...');

  try {
    await seedPostgreSQL();
    await seedDynamoDB();
    console.log('🎉 All databases seeded successfully!');
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

// Run the seeding process
if (require.main === module) {
  main();
}
