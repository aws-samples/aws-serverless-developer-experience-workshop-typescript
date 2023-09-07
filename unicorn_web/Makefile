#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.yaml)


#### Test Variables
apiUrl			= $(call cf_output,$(stackName),ApiUrl)


#### Build/Deploy Tasks
deps:
	npm install

build:
	sam validate --lint
	cfn-lint template.yaml -a cfn_lint_serverless.rules
	sam build -c $(DOCKER_OPTS)

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
	rm -rf .node_modules/ .aws-sam/ htmlcov/ .coverage || true

delete:
	sam delete --no-prompts --region "$$(aws configure get region)"

ci_init:
	npm ci


#### Helper Functions
define mcurl
	curl -s -X $(1) -H "Content-type: application/json" $(apiUrl)$(2) | jq
endef

define cf_output
	$(shell aws cloudformation describe-stacks \
		--output text \
		--stack-name $(1) \
		--query 'Stacks[0].Outputs[?OutputKey==`$(2)`].OutputValue')
endef
