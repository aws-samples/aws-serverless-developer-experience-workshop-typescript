#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.yaml)


#### Build/Deploy Tasks
ci: deps clean build deploy
deps:
	pnpm i

build:
	sam build -c $(DOCKER_OPTS)

deploy: deps build
	sam deploy --no-confirm-changeset



#### Test Variables
apiUrl			= $(call cf_output,$(stackName),ApiUrl)


#### Tests
test: unit-test integration-test

unit-test:
	pnpm test --  tests/unit/ --passWithNoTests

integration-test: 
	pnpm test --  tests/integration/

curl-test:
	$(call mcurl,GET,search/usa/anytown)
	$(call mcurl,GET,search/usa/anytown/main-street)
	$(call mcurl,GET,properties/usa/anytown/main-street/111)
	@echo "[DONE]"


#### Utilities
sync:
	sam sync --stack-name $(stackName) --watch

logs:
	sam logs --stack-name $(stackName) -t

clean:
	find . -type d -name __pycache__ -exec rm -rf {} \; 2>/dev/null || true
	find . -type f -name requirements.txt -exec rm -f {} \; 2>/dev/null || true
	pnpm exec jest --clearCache
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
