// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { STAGE, UNICORN_NAMESPACES } from '../../cdk/lib/helper';
import { PropertyApprovalStack } from '../../cdk/app/unicorn-properties-property-approval-stack';

describe('PropertyApprovalStack', () => {
  let app: cdk.App;
  let template: Template;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.PROPERTIES;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();

    // Create construct within the test stack
    const stack = new PropertyApprovalStack(app, 'TestPropertyApprovalStack', {
      // env required as Construct expects to look up SSM Parameters
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stage,
      eventBusNameParameter: 'testEventBus',
      contractStatusTableNameParameter: 'TestContractStatusTable',
      propertyApprovalSyncFunctionNameParameter: 'TestApprovalFunction',
    });

    // Prepare the template for assertions
    template = Template.fromStack(stack);
  });

  test('creates Lambda functions', () => {
    const functions = template.findResources('AWS::Lambda::Function');

    // Check that we have functions with expected logical IDs
    const logicalIds = Object.keys(functions);

    const waitForContractApprovalFunction = logicalIds.find((id) =>
      id.match(/.*WaitForContractApprovalFunction.*/)
    );
    expect(waitForContractApprovalFunction).toBeTruthy();

    if (waitForContractApprovalFunction) {
      const functionProps =
        functions[waitForContractApprovalFunction].Properties;
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
              Ref: 'uniproplocalTestContractStatusTableParameter',
            }),
            SERVICE_NAMESPACE: serviceNamespace,
          },
        },
      });
    }
  });

  test('CloudWatch log groups are created with correct retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 1,
    });
  });

  test('creates required IAM roles and policies', () => {
    // Test for State Machine IAM role
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'states.amazonaws.com',
            },
          },
        ],
        Version: '2012-10-17',
      },
      ManagedPolicyArns: [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/AWSXRayDaemonWriteAccess',
            ],
          ],
        },
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/ComprehendFullAccess',
            ],
          ],
        },
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/AmazonRekognitionFullAccess',
            ],
          ],
        },
      ],
    });
  });

  test('Step Function statemachine is created correctly', () => {
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
      TracingConfiguration: {
        Enabled: true,
      },
      LoggingConfiguration: {
        Level: 'ALL',
        IncludeExecutionData: true,
      },
    });
  });

  test('creates DLQ for workflow events', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'WorkflowEventsDlq-local',
      MessageRetentionPeriod: 1209600, // 14 days
      SqsManagedSseEnabled: true,
    });
  });

  test('creates EventBridge rule for PublicationApprovalRequested', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'unicorn.properties-PublicationApprovalRequested',
      Description:
        'PublicationApprovalRequested events published by the Web service.',
      EventPattern: {
        source: [UNICORN_NAMESPACES.WEB],
        'detail-type': ['PublicationApprovalRequested'],
      },
    });
  });

  test('creates PublicationEvaluationCompleted schema with correct configuration', () => {
    // Test schema creation
    template.hasResourceProperties('AWS::EventSchemas::Schema', {
      RegistryName: 'unicorn.properties-local',
      Type: 'OpenApi3',
      SchemaName: 'unicorn.properties-local@PublicationEvaluationCompleted',
    });
  });

  test('creates required CloudFormation outputs', () => {
    template.hasOutput('WaitForContractApprovalFunctionName', {});
    template.hasOutput('WaitForContractApprovalFunctionArn', {});
    template.hasOutput('ApprovalStateMachineLogGroupName', {});
    template.hasOutput('ApprovalStateMachineName', {});
    template.hasOutput('ApprovalStateMachineArn', {});
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 0);
    template.resourceCountIs('AWS::IAM::Role', 3);
    template.resourceCountIs('AWS::IAM::Policy', 3);
    template.resourceCountIs('AWS::Events::EventBus', 0);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::EventSchemas::Schema', 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 2);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
    template.resourceCountIs('AWS::SQS::Queue', 1);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 1);
  });
});
