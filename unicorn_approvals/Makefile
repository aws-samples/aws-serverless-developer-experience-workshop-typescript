# Makefile for Unicorn Approvals Service Infrastructure

# Variables
STAGE ?= local
REGION ?= ap-southeast-2
STACK_PREFIX = uni-prop-$(STAGE)

.PHONY: help build deploy deploy-domain deploy-service deploy-schema deploy-subscriptions deploy-contracts-subscriptions deploy-web-subscriptions test unit-test integration-test lint clean delete

help: ## Show available commands
	@echo "Unicorn Approvals Service Infrastructure"
	@echo ""
	@echo "Usage: make [target] [STAGE=local|dev|prod] [REGION=ap-southeast-2]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the application
	@echo "Building TypeScript application..."
	@npm install
	@sam build --template-file infrastructure/approvals-service/template.yaml

deploy-domain: ## Deploy domain resources (EventBridge, Schema Registry)
	@echo "Deploying domain resources..."
	@sam deploy \
		--template-file infrastructure/domain.yaml \
		--stack-name $(STACK_PREFIX)-approvals-domain \
		--parameter-overrides Stage=$(STAGE) \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-service: build ## Deploy service resources (Lambda, Step Functions, DynamoDB)
	@echo "Deploying service resources..."
	@sam deploy \
		--template-file infrastructure/approvals-service/template.yaml \
		--stack-name $(STACK_PREFIX)-approvals-service \
		--parameter-overrides Stage=$(STAGE) \
		--capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-schema: ## Deploy event schema
	@echo "Deploying event schema..."
	@sam deploy \
		--template-file infrastructure/schema-registry/PublicationEvaluationCompleted-schema.yaml \
		--stack-name $(STACK_PREFIX)-approvals-schema-PublicationEvaluationCompleted \
		--parameter-overrides Stage=$(STAGE) \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-subscriptions: deploy-contracts-subscriptions deploy-web-subscriptions ## Deploy event subscriptions

deploy-contracts-subscriptions: ## Deploy contracts event subscriptions
	@echo "Deploying contracts subscriptions..."
	@sam deploy \
		--template-file infrastructure/subscriptions/unicorn-contracts-subscriptions.yaml \
		--stack-name $(STACK_PREFIX)-approvals-contracts-subscriptions \
		--parameter-overrides Stage=$(STAGE) \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

deploy-web-subscriptions: ## Deploy web event subscriptions
	@echo "Deploying web subscriptions..."
	@sam deploy \
		--template-file infrastructure/subscriptions/unicorn-web-subscriptions.yaml \
		--stack-name $(STACK_PREFIX)-approvals-web-subscriptions \
		--parameter-overrides Stage=$(STAGE) \
		--region $(REGION) \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset

delete-contracts-subscriptions: ## Deploy contracts event subscriptions
	@echo "Deleting contracts subscriptions..."
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-contracts-subscriptions --region $(REGION) || true
	@echo "Waiting for subscription stack to be deleted..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-contracts-subscriptions --region $(REGION) || true
	@echo "Done"

delete-web-subscriptions: ## Deploy web event subscriptions
	@echo "Deleting web subscriptions..."
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-web-subscriptions --region $(REGION) || true
	@echo "Waiting for subscription stack to be deleted..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-web-subscriptions --region $(REGION) || true
	@echo "Done"

deploy: deploy-domain deploy-service deploy-schema deploy-contracts-subscriptions ## Deploy all infrastructure and application

test: ## Run tests
	@echo "Running tests..."
	@npm test

unit-test: ## Run unit tests only
	@echo "Running unit tests..."
	@npm run test -- --testPathPattern=tests/unit

integration-test: ## Run integration tests only
	@echo "Running integration tests..."
	@npm run test -- --testPathPattern=tests/integration

lint: ## Lint CloudFormation templates
	@echo "Linting CloudFormation templates..."
	@cfn-lint infrastructure/approvals-service.yaml -a cfn_lint_serverless.rules
	@cfn-lint infrastructure/domain.yaml
	@cfn-lint infrastructure/schema-registry/PublicationEvaluationCompleted-schema.yaml
	@cfn-lint infrastructure/subscriptions/unicorn-contracts-subscriptions.yaml
	@cfn-lint infrastructure/subscriptions/unicorn-web-subscriptions.yaml

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@rm -rf .aws-sam/
	@rm -rf node_modules/
	@rm -rf dist/

delete: ## Delete all stacks
	@echo "Deleting stacks in reverse order..."
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-web-subscriptions --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-contracts-subscriptions --region $(REGION) || true
	@echo "Waiting for subscription stacks to be deleted..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-web-subscriptions --region $(REGION) || true
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-contracts-subscriptions --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-schema-PublicationEvaluationCompleted --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-service --region $(REGION) || true
	@echo "Waiting for schema and service stacks to be deleted..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-schema-PublicationEvaluationCompleted --region $(REGION) || true
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_PREFIX)-approvals-service --region $(REGION) || true
	@aws cloudformation delete-stack --stack-name $(STACK_PREFIX)-approvals-domain --region $(REGION) || true
	@echo "All stacks deleted"