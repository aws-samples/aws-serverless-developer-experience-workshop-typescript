# Makefile for Unicorn Contracts Service Infrastructure

# Variables
STAGE ?= local
REGION ?= ap-southeast-2
STACK_PREFIX = uni-prop-$(STAGE)

.PHONY: help build deploy deploy-domain deploy-schema deploy-service test lint clean delete

help: ## Show available commands
	@echo "Unicorn Contracts Service Infrastructure"
	@echo ""
	@echo "Usage: make [target] [STAGE=local|dev|prod] [REGION=ap-southeast-2]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the application
	@echo "Building TypeScript application..."
	@npm install
	@sam build --template-file infrastructure/contracts-service.yaml

deploy-domain: ## Deploy domain resources (EventBridge, Schema Registry)
	@echo "Deploying domain resources..."
	@sam deploy \
		--template-file infrastructure/domain.yaml \
		--stack-name $(STACK_PREFIX)-contracts-domain \
		--parameter-overrides Stage=$(STAGE) \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-schema: ## Deploy event schema
	@echo "Deploying event schema..."
	@sam deploy \
		--template-file infrastructure/schema-registry/ContractStatusChanged-schema.yaml \
		--stack-name $(STACK_PREFIX)-contracts-schema-ContractStatusChanged \
		--parameter-overrides Stage=$(STAGE) \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-service: build ## Deploy service resources (Lambda, API Gateway, DynamoDB)
	@echo "Deploying service resources..."
	@sam deploy \
		--template-file infrastructure/contracts-service.yaml \
		--stack-name $(STACK_PREFIX)-contracts-contracts-service \
		--parameter-overrides Stage=$(STAGE) \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy: deploy-domain deploy-schema deploy-service ## Deploy all infrastructure and application

test: ## Run tests
	@echo "Running tests..."
	@npm test

lint: ## Lint CloudFormation templates
	@echo "Linting CloudFormation templates..."
	@cfn-lint infrastructure/contracts-service.yaml -a cfn_lint_serverless.rules
	@cfn-lint infrastructure/domain.yaml
	@cfn-lint infrastructure/schema-registry/ContractStatusChanged-schema.yaml

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -rf .aws-sam/
	@rm -rf node_modules/
	@rm -rf dist/

delete: ## Delete all stacks
	@echo "Deleting stacks in reverse order..."
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-contracts-contracts-service --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-contracts-schema-ContractStatusChanged --region $(REGION) || true
	@echo "Waiting for service and schema stacks to be deleted..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-contracts-contracts-service --region $(REGION) || true
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-contracts-schema-ContractStatusChanged --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-contracts-domain --region $(REGION) || true
	@echo "All stacks deleted"