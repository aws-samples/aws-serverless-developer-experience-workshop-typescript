#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.yaml)


#### Build/Deploy Tasks
build:
	sam validate --lint
	cfn-lint template.yaml -a cfn_lint_serverless.rules
	sam build -c $(DOCKER_OPTS)

deps:
	npm install

deploy: build
	sam deploy


#### Tests
test: unit-test integration-test

unit-test:
	npm test --  tests/unit/

integration-test: deps
	npm test --  tests/integration/

#### Utilities
sync:
	sam sync --stack-name $(stackName) --watch

logs:
	sam logs --stack-name $(stackName) -t

clean:
	find . -type d -name __pycache__ -exec rm -rf {} \; 2>/dev/null || true
	find . -type f -name requirements.txt -exec rm -f {} \; 2>/dev/null || true
	npx jest --clearCache
	rm -rf .aws-sam/ htmlcov/ .coverage || true

delete:
	sam delete --stack-name $(stackName) --no-prompts

ci_init:
	npm ci