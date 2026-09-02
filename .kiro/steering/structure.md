# Project Structure & Conventions

## Repository Layout

Multi-service monorepo with three services plus shared infrastructure:

```text
├── unicorn_contracts/     # Contracts Service - property contracts
├── unicorn_approvals/     # Approvals Service - approval workflow
├── unicorn_web/           # Web Service - property listings and search
├── unicorn_shared/        # Global namespaces and shared images stacks
├── docs/                  # Documentation and architecture diagrams
├── package.json           # Workspace root (lint/format tooling, husky)
└── pnpm-workspace.yaml    # pnpm workspace definition
```

## Service Structure Pattern

Each service follows this structure. Maintain it when adding or modifying services:

```text
unicorn_<service>/
├── Makefile               # Canonical build/deploy/test interface
├── package.json           # Service dependencies and pnpm scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest test configuration
├── eslint.config.mjs      # ESLint flat config
├── src/
│   └── <service>_service/ # Lambda handlers and domain code (snake_case dir)
├── tests/
│   ├── unit/              # Unit tests (+ events/ payloads)
│   ├── integration/       # Integration tests against deployed stacks
│   └── data/              # Shared test data
├── state_machine/         # Step Functions ASL definitions (approvals only)
└── infrastructure/        # All IaC for the service (see below)
```

## Infrastructure Layout

Every service owns its infrastructure under `infrastructure/`:

```text
infrastructure/
├── domain.yaml                     # Event bus, bus policies, schema registry,
│                                   #   catch-all rule, SSM exports
├── <service>-service/
│   ├── template.yaml               # Lambda, API Gateway, DynamoDB, queues
│   ├── samconfig.toml              # SAM build/deploy configuration
│   └── api.yaml                    # OpenAPI specification (REST services)
├── schema-registry/
│   └── <EventName>-schema.yaml     # One stack per published event schema
└── subscriptions/
    └── <producer>-subscriptions.yaml  # Rules on producer buses feeding this service
```

Deploy order: shared namespaces first, then per service `domain -> schema -> service`; subscriptions reference both participating domains. `make deploy` and `make delete` encode the correct (reverse) order.

## Code Conventions

- Source directories are snake_case (`contracts_service`, `approvals_service`, `publication_manager_service`, `search_service`)
- Lambda handler files are camelCase and describe the trigger (`contractEventHandler.ts`)
- Shared Powertools setup lives in `src/<service>_service/powertools.ts`
- Event schema models live in `src/schema/`
- Format with Prettier, lint with ESLint before committing (`pnpm run format`, `pnpm run lint`)

## Resource Naming & Events

- Stack names: `uni-prop-{stage}-{service}` (e.g., `uni-prop-local-contracts`); schema stacks append `-schema-<EventName>`
- Event buses: `unicorn-{service}-eventbus-${Stage}` (e.g., `unicorn-contracts-eventbus-local`), exported via SSM
- Event sources use the service namespace value (e.g., `unicorn-contracts`), resolved from the SSM namespace parameters — never hardcode it
- Canonical event detail types: `ContractStatusChanged` (Contracts), `PublicationApprovalRequested` (Web), `PublicationEvaluationCompleted` (Approvals)
- SSM parameter contracts:
  - Global namespaces: `/uni-prop/Unicorn{Service}Namespace`
  - Stage-scoped: `/uni-prop/${Stage}/{Service}EventBus`, `...EventBusArn`, `...SchemaRegistryName`
- Each domain template includes a catch-all rule logging all bus events to CloudWatch for debugging

## Testing Conventions

```text
tests/
├── unit/                  # Fast tests, SDK calls mocked (aws-sdk-client-mock)
│   └── events/            # Sample event payloads (e.g., create_contract_valid_1.json)
├── integration/           # Run against a deployed stack (make integration-test)
└── data/                  # Shared fixtures
```

- Test event naming: `[action]_[entity]_[condition]_[n].json` (e.g., `create_contract_valid_1.json`)
- Unit tests run in-band (`--runInBand`); integration tests require a deployed `local` stage stack

## Development Workflow

When adding a feature:

1. Implement the handler in `src/<service>_service/` following existing patterns
2. Add or update SAM resources in `infrastructure/<service>-service/template.yaml` using the naming conventions above
3. Add unit test payloads under `tests/unit/events/` and tests beside existing ones
4. If the change publishes or consumes a new event: update `infrastructure/schema-registry/` and the consumer's `infrastructure/subscriptions/`
5. Run `make lint` and `make test` before deploying with `make deploy STAGE=local`

When modifying services, preserve the existing structure — do not reorganize directories without a documented reason.
