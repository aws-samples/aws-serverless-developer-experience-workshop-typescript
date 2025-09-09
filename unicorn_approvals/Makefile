#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.toml)


#### Build/Deploy Tasks
ci: deps build deploy
deps:
	pnpm i

build:
	sam build -c $(DOCKER_OPTS)

deploy: deps build
	sam deploy --no-confirm-changeset



#### Tests
test: unit-test integration-test

unit-test:
	pnpm test --  tests/unit/

integration-test: 
	pnpm test -- tests/integration/

#### Utilities
sync:
	sam sync --stack-name $(stackName) --watch

logs:
	sam logs --stack-name $(stackName) -t

clean:
	find . -type d -name __pycache__ -exec rm -rf {} \; 2>/dev/null || true
	find . -type f -name requirements.txt -exec rm -f {} \; 2>/dev/null || true
	pnpm exec jest --clearCache
	rm -rf node_modules/ .pytest_cache/ .aws-sam/ htmlcov/ .coverage || true

delete:
	sam delete --stack-name $(stackName) --no-prompts

ci_init:
	pnpm i
