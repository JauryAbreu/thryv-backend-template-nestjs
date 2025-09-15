# Thryv Backend Template - NestJS

A production-ready Node.js template built with TypeScript and NestJS, designed for microservices architecture with AWS Lambda deployment support. Features modular design, PostgreSQL/DynamoDB integration, Auth0 authentication, and comprehensive observability with Datadog and Cube Cloud analytics.

## 🏗️ Architecture Overview

This template implements a modular microservices architecture using:

- **Framework**: NestJS with TypeScript (strict mode)
- **Databases**: PostgreSQL (via TypeORM) and DynamoDB (AWS SDK v3)
- **Authentication**: Auth0 JWT with RS256 validation
- **Deployment**: AWS Lambda via Serverless Framework
- **Observability**: Datadog APM, CloudWatch logging, Cube Cloud analytics
- **Testing**: Jest with unit, integration, and E2E tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

### Entity Design

#### Customer Entity (PostgreSQL)
- **id**: UUID (primary key)
- **identification**: string (max 25 chars, unique)
- **name**: string (max 50 chars)  
- **lastname**: string (max 50 chars)
- **dateBorn**: date
- **gender**: enum ['male','female','other']
- **status**: enum ['active','pending','inactive']
- **createDate/updateDate**: UTC timestamps
- **deletedAt**: nullable datetime for soft delete

#### Company Entity (DynamoDB)
- **id**: UUID (partition key)
- **identification**: string (max 25 chars, GSI)
- **name**: string (max 50 chars)
- **alias**: string (max 100 chars)
- **address**: string (max 250 chars)
- **status**: enum ['active','pending','inactive']
- **createDate/updateDate**: ISO 8601 strings
- **deletedAt**: nullable for soft delete

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- AWS CLI (for deployment)
- Auth0 account (for authentication)

### Local Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd thryv-backend-template-nestjs
npm install
```

2. **Environment configuration**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

3. **Start local services**
```bash
# Start PostgreSQL, DynamoDB Local, and supporting services
npm run docker:up

# Run database migrations and seed data
npm run seed:dev

# Note: If you encounter database connection issues, clean Docker volumes:
# docker-compose down -v && docker-compose up postgres dynamodb-local -d
```

4. **Start the application**
```bash
# Development mode with hot reload
npm run start:dev

# Application will be available at http://localhost:3000
# API documentation at http://localhost:3000/api/docs
```

### Environment Variables

Required environment variables (see `.env.example` for complete list):

```bash
# Core Configuration
NODE_ENV=development
PORT=3000

# Database URLs
DATABASE_URL=postgresql://postgres:password@localhost:5432/thryv_db
DYNAMODB_REGION=us-east-1
DYNAMODB_TABLE_COMPANY=company-table
DYNAMODB_ENDPOINT=http://localhost:8000  # Local development only

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_JWKS_URI=https://your-domain.auth0.com/.well-known/jwks.json

# Observability
DD_API_KEY=your-datadog-api-key
DD_SERVICE=thryv-backend
DD_ENV=development
CUBE_API_URL=https://your-deployment.cubecloud.dev/cubejs-api/v1
CUBE_API_TOKEN=your-cube-token

# Security & Performance
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
LOG_LEVEL=debug
```

## 📡 API Endpoints

All endpoints require `Authorization: Bearer <jwt-token>` header.

### Customers (PostgreSQL)
- `POST /customers` - Create customer
- `GET /customers` - List customers (supports pagination & status filter)
- `GET /customers/:id` - Get customer by ID
- `GET /customers/identification/:identification` - Get by identification
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Soft delete customer
- `PATCH /customers/:id/restore` - Restore deleted customer

### Companies (DynamoDB)  
- `POST /companies` - Create company
- `GET /companies` - List companies (supports pagination & status filter)
- `GET /companies/:id` - Get company by ID
- `GET /companies/identification/:identification` - Get by identification
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Soft delete company
- `PATCH /companies/:id/restore` - Restore deleted company

### Reports & Analytics
- `GET /reports/customers` - Customer analytics report
- `GET /reports/companies` - Company analytics report  
- `GET /reports/dashboard` - Combined analytics dashboard
- `GET /reports/health` - Reports service health check

### Health & Status
- `GET /` - Basic health check
- `GET /health` - Detailed health check with system info

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Database Setup

Tests use isolated test databases:
- PostgreSQL: `thryv_test_db`
- DynamoDB Local: `company-table-test`

Test configuration automatically mocks Auth0 JWT validation.

## 🐳 Docker Development

The template includes comprehensive Docker support:

```bash
# Start all services (app, PostgreSQL, DynamoDB, Redis, Admin UIs)
docker-compose up

# Alternative: Development version with additional services
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Clean restart (removes volumes and cached data)
docker-compose down -v && docker-compose up --build
```

### Included Services
- **Application**: NestJS app with hot reload
- **PostgreSQL**: Database with PgAdmin UI (port 8080)
- **DynamoDB Local**: NoSQL database with Admin UI (port 8001)  
- **Redis**: Caching layer
- **Health checks**: Automatic service dependency management

## ☁️ AWS Lambda Deployment

### Deployment Commands

```bash
# Install Serverless Framework globally
npm install -g serverless@3

# Build and deploy to development
npm run build
npm run serverless:deploy:dev

# Deploy to staging  
npm run serverless:deploy:staging

# Deploy to production
npm run serverless:deploy:prod

# Remove deployment
npm run serverless:remove
```

### AWS Resources Created

The serverless deployment creates:
- **Lambda Functions**: API and Reports handlers
- **DynamoDB Table**: Company table with GSI
- **CloudWatch Log Groups**: Structured logging  
- **IAM Roles**: Least privilege access
- **API Gateway**: HTTP endpoints with CORS

### Environment-Specific Deployment

Configure environment variables for each stage:

```bash
# Development
export SERVERLESS_STAGE=development
export DATABASE_URL=postgresql://...
export DYNAMODB_TABLE_COMPANY=company-dev
export AUTH0_DOMAIN=dev.auth0.com
# ... other dev-specific vars

# Staging  
export SERVERLESS_STAGE=staging
# ... staging-specific vars

# Production
export SERVERLESS_STAGE=production  
# ... production-specific vars
```

## 📊 Observability & Monitoring

### Datadog Integration

The template includes comprehensive Datadog integration:

- **APM Tracing**: Automatic request tracing with custom tags
- **Structured Logging**: JSON logs with correlation IDs
- **Custom Metrics**: Request counts, error rates, latency
- **Service Map**: Automatic service discovery

Configuration:
```bash
DD_API_KEY=your-datadog-key
DD_SERVICE=thryv-backend  
DD_ENV=production
DD_VERSION=1.0.0
DD_TRACE_ENABLED=true
```

### CloudWatch Logging

Structured JSON logs automatically forwarded to CloudWatch:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info", 
  "message": "Customer created successfully",
  "service": "thryv-backend",
  "requestId": "uuid-123",
  "traceId": "datadog-trace-id",
  "userId": "auth0-user-id"
}
```

### Cube Cloud Analytics

Integrated analytics with Cube Cloud for advanced reporting:

- **Real-time Dashboards**: Customer and company metrics
- **Custom Queries**: Flexible data exploration  
- **API Integration**: Automatic data forwarding
- **Business Intelligence**: Growth and trend analysis

## 🔒 Security & Authentication

### Auth0 JWT Validation

- **Algorithm**: RS256 with JWKS validation
- **Claims Validation**: Issuer, audience, expiration
- **Role-Based Access**: Custom roles claim support
- **Rate Limiting**: Configurable per endpoint

### Example JWT Payload
```json
{
  "sub": "auth0|user-123",
  "email": "user@example.com", 
  "roles": ["admin", "analyst"],
  "permissions": ["read:customers", "write:companies"],
  "aud": "thryv-api",
  "iss": "https://thryv.auth0.com/"
}
```

### Security Headers & Middleware

- **Helmet**: Security headers (CSP, HSTS, etc.)
- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: Request throttling
- **Input Validation**: Class-validator with DTOs
- **SQL Injection Prevention**: TypeORM parameterized queries

## 📁 Project Structure

```
src/
├── common/                    # Shared modules
│   ├── auth/                 # Authentication & authorization
│   │   ├── guards/           # JWT & roles guards
│   │   ├── strategies/       # Passport strategies
│   │   └── auth.module.ts
│   ├── interceptors/         # Logging & response interceptors
│   ├── services/            # Shared services (logger)
│   └── common.module.ts
├── config/                   # Configuration files
│   ├── database.config.ts    # TypeORM configuration
│   └── tracing.config.ts     # Datadog tracing setup
├── modules/                  # Business modules
│   ├── customer/            # Customer module (PostgreSQL)
│   │   ├── controllers/     # REST controllers  
│   │   ├── dto/            # Data transfer objects
│   │   ├── entities/       # TypeORM entities
│   │   ├── services/       # Business logic
│   │   └── customer.module.ts
│   ├── company/            # Company module (DynamoDB)  
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/       # DynamoDB entities
│   │   ├── repositories/   # DynamoDB repository
│   │   ├── services/
│   │   └── company.module.ts
│   └── reports/            # Analytics & reporting
│       ├── controllers/
│       ├── services/       # Cube Cloud integration
│       └── reports.module.ts
├── app.controller.ts       # Health check endpoints
├── app.module.ts          # Root application module
├── app.service.ts         # Application service
├── main.ts               # Application entry point
└── lambda.ts            # AWS Lambda entry point

scripts/                   # Utility scripts
├── init-db.sql           # PostgreSQL initialization
└── seed.ts              # Database seeding script

test/                     # Test configuration
├── jest-e2e.json        # E2E test config
├── jest-integration.json # Integration test config  
└── setup.ts             # Test setup & mocks

docker/                   # Docker configuration
└── dynamodb/            # DynamoDB Local data

.github/workflows/        # CI/CD pipeline
└── ci-cd.yml            # GitHub Actions workflow
```

## 🔄 Development Workflow

### Git Flow
- **main**: Production-ready code
- **develop**: Integration branch for features  
- **feature/***: Feature development branches
- **hotfix/***: Critical production fixes

### Code Quality Gates
1. **Pre-commit**: Husky runs linting and formatting
2. **CI Pipeline**: Automated testing and security scans
3. **Code Review**: Required for all Pull Requests
4. **Deployment**: Automatic deployment on branch push

### Branch Protection Rules
```bash
# Main branch protection
- Require PR reviews (2 reviewers)
- Require status checks (CI pipeline)  
- Require branches to be up to date
- Restrict pushes to admins only
```

## 📈 Performance & Scaling

### Optimization Strategies

- **Database Indexing**: Optimized indexes for query patterns
- **Connection Pooling**: TypeORM connection management  
- **Caching Layer**: Redis for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Bundle Optimization**: Tree shaking and minification

### Lambda Performance
- **Cold Start Optimization**: Provisioned concurrency for critical functions
- **Memory Allocation**: Right-sized memory per function type
- **VPC Configuration**: Optional VPC for database access
- **Connection Reuse**: Persistent database connections

### Monitoring & Alerting
```bash
# Key metrics to monitor
- Lambda duration & cold starts
- Database connection pool usage  
- API response times (p95, p99)
- Error rates by endpoint
- Authentication failure rates
```

## 🛠️ Migration & Database Management

### TypeORM Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- -n CreateCustomerTable

# Run pending migrations  
npm run migration:run

# Revert last migration
npm run migration:revert
```

### DynamoDB Schema Management

DynamoDB tables are managed via serverless.yml and created automatically during deployment. For local development, tables are created by the seeding script.

### Data Seeding

```bash
# Seed development data
npm run seed:dev

# Seed specific environment
NODE_ENV=staging npm run seed
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Failures**
```bash
# Check database status
docker-compose ps postgres

# View database logs  
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

**2. DynamoDB Local Issues**
```bash
# Reset DynamoDB Local data
rm -rf docker/dynamodb/*
docker-compose restart dynamodb-local
```

**3. Docker Build Errors**
```bash
# If encountering "compression is not a function" error:
# This is already fixed in the template with proper ES6 imports

# If encountering TypeORM dependency issues:
# Clean rebuild the Docker container
docker-compose down
docker-compose build app --no-cache
docker-compose up

# If Husky errors during Docker build:
# The template uses Dockerfile.dev which sets HUSKY=0
```

**4. PostgreSQL Schema Conflicts**
```bash
# If seeing "column contains null values" errors:
docker exec -it <postgres_container> psql -U postgres -d thryv_db \
  -c "DROP TABLE IF EXISTS customers CASCADE; DROP TYPE IF EXISTS customers_gender_enum CASCADE;"
docker-compose restart app
```

**5. Auth0 JWT Validation Errors**
```bash
# Verify Auth0 configuration
curl https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json

# Check JWT token validity
# Use jwt.io to decode and verify token
```

**6. Lambda Deployment Failures**  
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify serverless configuration
serverless print --stage development

# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name thryv-backend-dev
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run start:dev
```

### Health Checks

Monitor application health:
```bash  
# Basic health check
curl http://localhost:3000/health

# Database connectivity
curl http://localhost:3000/health | jq '.databases'

# Reports service health  
curl http://localhost:3000/reports/health
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow ESLint and Prettier configurations
2. **Testing**: Maintain >80% code coverage  
3. **Documentation**: Update README for significant changes
4. **Commit Messages**: Use conventional commit format
5. **Type Safety**: Leverage TypeScript strict mode

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all CI checks pass
4. Request code review from team members
5. Merge to `develop` after approval

### Code Review Checklist

- [ ] Code follows established patterns
- [ ] Tests cover new functionality  
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Error handling implemented

## 📋 Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Security scan passed (Snyk/OWASP)
- [ ] Load testing completed  
- [ ] Monitoring dashboards configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Rate limiting configured appropriately

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check existing [GitHub Issues](../../issues)
2. Review troubleshooting section above  
3. Create new issue with detailed description
4. Contact: [dev-team@thryv.com](mailto:dev-team@thryv.com)

---

**Built with ❤️ by the Thryv Engineering Team**
