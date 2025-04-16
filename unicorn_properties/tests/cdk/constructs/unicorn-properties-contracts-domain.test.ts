// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as events from 'aws-cdk-lib/aws-events';
import { STAGE, UNICORN_NAMESPACES } from '../../../cdk/constructs/helper';
import { ContractsDomain } from '../../../cdk/constructs/unicorn-properties-contracts-domain';

describe('ContractsDomain', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.PROPERTIES;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');

    // Create required props for the construct
    const eventBus = new events.EventBus(stack, 'TestEventBus');

    // Create construct within the test stack
    new ContractsDomain(stack, 'TestContractsDomain', {
      stage,
      eventBus,
    });

    // Prepare the template for assertions
    template = Template.fromStack(stack);
  });

  test('DynamoDB table is created with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      AttributeDefinitions: [
        {
          AttributeName: 'property_id',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'property_id',
          KeyType: 'HASH',
        },
      ],
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  });

  test('creates DLQ for workflow events', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'PropertiesServiceDlq-local',
      MessageRetentionPeriod: 1209600, // 14 days
      SqsManagedSseEnabled: true,
    });

    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'ContractStatusChangedEventsDlq-local',
      MessageRetentionPeriod: 1209600, // 14 days
      SqsManagedSseEnabled: true,
    });
  });

  test('creates Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);

    const functions = template.findResources('AWS::Lambda::Function');

    // Check that we have functions with expected logical IDs
    const logicalIds = Object.keys(functions);

    const propertiesApprovalSyncFunction = logicalIds.find((id) =>
      id.match(/.*PropertiesApprovalSyncFunction.*/)
    );
    expect(propertiesApprovalSyncFunction).toBeTruthy();

    if (propertiesApprovalSyncFunction) {
      const functionProps =
        functions[propertiesApprovalSyncFunction].Properties;
      expect(functionProps).toMatchObject({
        Handler: 'index.lambdaHandler',
        Runtime: 'nodejs20.x',
        Timeout: 15,
        MemorySize: 128,
        TracingConfig: {
          Mode: 'Active',
        },
        Environment: {
          Variables: {
            DYNAMODB_TABLE: expect.objectContaining({
              Ref: expect.stringContaining(
                'TestContractsDomainContractStatusTable'
              ),
            }),
            SERVICE_NAMESPACE: serviceNamespace,
          },
        },
      });
    }
  });

  test('creates eventSourceMapping', () => {
    const eventSourceMapping = template.findResources(
      'AWS::Lambda::EventSourceMapping'
    );

    // Check that we have functions with expected logical IDs
    const logicalIds = Object.keys(eventSourceMapping);

    const eventSourceMappingId = logicalIds.find((id) =>
      id.match(/.*PropertiesApprovalSyncFunctionlocalDynamoDBEventSource.*/)
    );
    expect(eventSourceMappingId).toBeTruthy();

    template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
      BatchSize: 100,
      FunctionName: {
        Ref: Match.stringLikeRegexp('.*PropertiesApprovalSyncFunction.*'),
      },
      DestinationConfig: {
        OnFailure: {
          Destination: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('.*PropertiesServiceDlq.*'),
              'Arn',
            ],
          },
        },
      },
      EventSourceArn: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp(
            '.*TestContractsDomainContractStatusTableB4ACAC8D.*'
          ),
          'StreamArn',
        ],
      },
      StartingPosition: 'TRIM_HORIZON',
    });
  });

  test('creates EventBridge rule for ContractStatusChanged', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'unicorn.properties-ContractStatusChanged',
      Description:
        'ContractStatusChanged events published by the Contracts service.',
      EventPattern: {
        source: [UNICORN_NAMESPACES.CONTRACTS],
        'detail-type': ['ContractStatusChanged'],
      },
    });
  });

  test('creates required CloudFormation outputs', () => {
    template.hasOutput('ContractStatusTableName', {});
    template.hasOutput('ContractStatusChangedHandlerFunctionArn', {});
    template.hasOutput('ContractStatusChangedHandlerFunctionName', {});
    template.hasOutput('PropertiesApprovalSyncFunctionName', {});
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::IAM::Role', 2);
    template.resourceCountIs('AWS::IAM::Policy', 2);
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.resourceCountIs('AWS::Lambda::Permission', 1);
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 2);
    template.resourceCountIs('AWS::SQS::Queue', 2);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 1);
  });
});
