import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/thryv_test_db';
process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
process.env.DYNAMODB_TABLE_COMPANY = 'company-table-test';

// Mock Auth0 for testing
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => 'test-secret'),
}));

// Global test timeout
jest.setTimeout(30000);
