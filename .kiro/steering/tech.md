# Technology Stack & Build System

## Runtime & Language

- **TypeScript 5** on **Node.js** - all Lambda functions (compiled with esbuild via SAM)
- **pnpm** - package manager, with a workspace (`pnpm-workspace.yaml`) spanning `unicorn_shared`, `unicorn_contracts`, `unicorn_approvals`, and `unicorn_web`
- **AWS SAM** - infrastructure as code, build, and deployment

## AWS Services

- **AWS Lambda** - serverless compute
- **Amazon DynamoDB** - NoSQL persistence with streams
- **Amazon EventBridge** - event bus, schema registry, and cross-service messaging
- **AWS Step Functions** - approval workflow orchestration
- **Amazon API Gateway** - REST API endpoints
- **Amazon SQS** - ingest queues and dead-letter queues
- **AWS X-Ray** - distributed tracing
- **Amazon CloudWatch** - logging, metrics, and monitoring

## Key Libraries & Frameworks

- **AWS Lambda Powertools for TypeScript** (`@aws-lambda-powertools/logger`, `metrics`, `tracer`) - structured logging, metrics, and tracing
- **AWS SDK for JavaScript v3** (`@aws-sdk/client-*`, `@aws-sdk/lib-dynamodb`) - AWS service clients
- **Jest** with `ts-jest` - unit and integration testing; `aws-sdk-client-mock` for SDK mocking
- **ESLint** (flat config, `typescript-eslint`) and **Prettier** - linting and formatting; **husky** runs hooks from the workspace root

## Build & Development Commands

### Make Targets (canonical interface)

Run from a service directory (e.g., `unicorn_contracts/`). Stages: `local` (default), `dev`, `prod`; default region `ap-southeast-2`.

```bash
make build STAGE=local      # Install deps and sam build the service template
make deploy STAGE=local     # deploy-domain + deploy-schema + deploy-service
make deploy-domain          # Event bus, schema registry (infrastructure/domain.yaml)
make deploy-schema          # Event schema stack(s)
make deploy-service         # Lambda, API Gateway, DynamoDB (service template)
make test                   # Run all tests
make unit-test              # Unit tests only
make integration-test       # Integration tests only (deployed stack required)
make lint                   # cfn-lint all infrastructure templates
make clean                  # Remove .aws-sam/, node_modules/, dist/
make delete                 # Delete stacks in reverse dependency order
```

`unicorn_shared/` has its own targets: `deploy-namespaces`, `deploy-images`, `delete-namespaces`, `delete-images`, `list-parameters`. Deploy shared namespaces before any service.

### Runtime Commands

Inside a service directory, the make targets invoke pnpm scripts you can also run directly:

```bash
pnpm install          # Install dependencies
pnpm test             # Jest (all tests, --runInBand)
pnpm run unit         # Jest unit tests only
pnpm run lint         # ESLint with --fix
pnpm run format       # Prettier over **/*.ts
pnpm run compile      # Type-check with tsc
```

### SAM Commands

```bash
sam build --cached --parallel                  # Build (config in samconfig.toml)
sam deploy --no-confirm-changeset              # Deploy current service
sam validate --lint                            # Validate templates
sam sync --watch                               # Rapid dev iteration
sam local start-api --warm-containers EAGER    # Local API
sam local start-lambda --warm-containers EAGER # Local Lambda endpoint
```

`samconfig.toml` in each `infrastructure/<service>-service/` directory sets stack name, cached/parallel builds, `disable_rollback` for dev iteration, and `Stage` parameter overrides.

## Environment Variables

Standard Lambda environment variables set in the SAM templates:

- `DYNAMODB_TABLE` - DynamoDB table name
- `SERVICE_NAMESPACE` - service identifier for event sources (from SSM namespace parameters)
- `POWERTOOLS_SERVICE_NAME`, `POWERTOOLS_METRICS_NAMESPACE` - Powertools identifiers
- `POWERTOOLS_LOG_LEVEL`, `POWERTOOLS_LOGGER_LOG_EVENT`, `POWERTOOLS_LOGGER_SAMPLE_RATE`, `POWERTOOLS_TRACE_DISABLED` - observability tuning (stage-mapped)
- `LOG_LEVEL` - application log level
