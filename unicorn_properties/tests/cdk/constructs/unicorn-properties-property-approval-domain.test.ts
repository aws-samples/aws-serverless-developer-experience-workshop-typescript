// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

import { STAGE, UNICORN_NAMESPACES } from '../../../cdk/constructs/helper';
import { PropertyApprovalDomain } from '../../../cdk/constructs/unicorn-properties-property-approval-domain';

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
    const table = new dynamodb.TableV2(stack, 'TestTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
    const taskResponseFunction = new nodejs.NodejsFunction(
      stack,
      'TestFunction',
      {
        entry: path.join(
          __dirname,
          '../../../src/properties_service/contractStatusChangedEventHandler.ts'
        ),
      }
    );
    // Create construct within the test stack
    new PropertyApprovalDomain(stack, 'TestPropertyApprovalDomain', {
      stage,
      eventBus,
      table,
      taskResponseFunction,
    });

    // Prepare the template for assertions
    template = Template.fromStack(stack);
  });

  test('creates Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);

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
              Ref: expect.stringContaining('TestTable'),
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

  test('creates required CloudFormation outputs', () => {
    template.hasOutput('WaitForContractApprovalFunctionName', {});
    template.hasOutput('WaitForContractApprovalFunctionArn', {});
    template.hasOutput('ApprovalStateMachineLogGroupName', {});
    template.hasOutput('ApprovalStateMachineName', {});
    template.hasOutput('ApprovalStateMachineArn', {});
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::IAM::Role', 4);
    template.resourceCountIs('AWS::IAM::Policy', 4);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.resourceCountIs('AWS::Logs::LogGroup', 2);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
    template.resourceCountIs('AWS::SQS::Queue', 1);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 1);
  });
});
