import { Injectable } from '@nestjs/common';
import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  UpdateItemCommand, 
  DeleteItemCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand,
  ScanCommand as DocScanCommand,
  QueryCommand as DocQueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { CompanyEntity, CompanyStatus, Company } from '../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompanyRepository {
  private readonly dynamoClient: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const region = process.env.DYNAMODB_REGION || 'us-east-1';
    const endpoint = process.env.DYNAMODB_ENDPOINT; // For local development
    
    this.dynamoClient = new DynamoDBClient({
      region,
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
      },
    });

    this.docClient = DynamoDBDocumentClient.from(this.dynamoClient);
    this.tableName = process.env.DYNAMODB_TABLE_COMPANY || 'company-table';
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyEntity> {
    const company = new CompanyEntity({
      id: uuidv4(),
      identification: createCompanyDto.identification,
      name: createCompanyDto.name,
      alias: createCompanyDto.alias,
      address: createCompanyDto.address,
      status: createCompanyDto.status || CompanyStatus.PENDING,
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    });

    // Validate domain invariants
    company.validateIdentification();
    company.validateName();
    company.validateAlias();
    company.validateAddress();

    const command = new PutCommand({
      TableName: this.tableName,
      Item: company,
      ConditionExpression: 'attribute_not_exists(id)',
    });

    await this.docClient.send(command);
    return company;
  }

  async findAll(
    limit: number = 10,
    lastEvaluatedKey?: any,
    status?: CompanyStatus,
  ): Promise<{ companies: CompanyEntity[]; lastEvaluatedKey?: any; count: number }> {
    const filterExpression = 'attribute_not_exists(deletedAt)' + 
      (status ? ' AND #status = :status' : '');
    
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};
    
    if (status) {
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    const command = new DocScanCommand({
      TableName: this.tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const result = await this.docClient.send(command);
    const companies = (result.Items || []).map(item => new CompanyEntity(item as Company));

    return {
      companies,
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Count || 0,
    };
  }

  async findOne(id: string): Promise<CompanyEntity | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.docClient.send(command);
    
    if (!result.Item || result.Item.deletedAt) {
      return null;
    }

    return new CompanyEntity(result.Item as Company);
  }

  async findByIdentification(identification: string): Promise<CompanyEntity | null> {
    // Use GSI for identification lookup
    const command = new DocQueryCommand({
      TableName: this.tableName,
      IndexName: 'identification-index', // GSI name
      KeyConditionExpression: 'identification = :identification',
      FilterExpression: 'attribute_not_exists(deletedAt)',
      ExpressionAttributeValues: {
        ':identification': identification,
      },
    });

    const result = await this.docClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return new CompanyEntity(result.Items[0] as Company);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyEntity | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }

    existing.update(updateCompanyDto);

    const command = new PutCommand({
      TableName: this.tableName,
      Item: existing,
    });

    await this.docClient.send(command);
    return existing;
  }

  async softDelete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) {
      return false;
    }

    existing.softDelete();

    const command = new PutCommand({
      TableName: this.tableName,
      Item: existing,
    });

    await this.docClient.send(command);
    return true;
  }

  async restore(id: string): Promise<CompanyEntity | null> {
    // Find even if soft deleted
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.docClient.send(command);
    
    if (!result.Item) {
      return null;
    }

    const company = new CompanyEntity(result.Item as Company);
    company.restore();

    const updateCommand = new PutCommand({
      TableName: this.tableName,
      Item: company,
    });

    await this.docClient.send(updateCommand);
    return company;
  }
}
