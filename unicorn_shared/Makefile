#### Global Variables
stackName		:= $(shell yq -oy '.default.global.parameters.stack_name' samconfig.yaml)


#### Build/Deploy Tasks
build:
	sam build -c $(DOCKER_OPTS)

deps:


deploy: build
	sam deploy


#### Tests
test: 



#### Utilities
ci_init:
	pnpm i
