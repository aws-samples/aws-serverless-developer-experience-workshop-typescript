#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.yaml)


#### Build/Deploy Tasks
build:
	sam validate --lint
	cfn-lint template.yaml -a cfn_lint_serverless.rules
	poetry export --without-hashes --format=requirements.txt --output=src/requirements.txt
	sam build -c $(DOCKER_OPTS)

deps:
	npm install
	poetry install

deploy: build
	sam deploy


#### Tests
test: unit-test integration-test

unit-test:
	npm test --  tests/unit/

integration-test: deps
	poetry run pytest tests/integration/

#### Utilities
sync:
	sam sync --stack-name $(stackName) --watch

logs:
	sam logs --stack-name $(stackName) -t

clean:
	find . -type d -name __pycache__ -exec rm -rf {} \; 2>/dev/null || true
	find . -type f -name requirements.txt -exec rm -f {} \; 2>/dev/null || true
	npx jest --clearCache
	rm -rf node_modules/ .pytest_cache/ .aws-sam/ htmlcov/ .coverage || true

delete:
	sam delete --stack-name $(stackName) --no-prompts

# NOTE: [2023-05-09] This is a fix for installing Poetry dependencies in GitHub Actions
ci_init:
	npm ci
	poetry export --without-hashes --format=requirements.txt --output=src/requirements.txt --with dev
	poetry run pip install -r src/requirements.txt
	poetry install -n
