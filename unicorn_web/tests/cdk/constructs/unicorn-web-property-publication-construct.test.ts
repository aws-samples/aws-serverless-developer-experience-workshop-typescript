// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import { STAGE, UNICORN_NAMESPACES } from '../../../cdk/constructs/helper';
import { PropertyPublicationConstruct } from '../../../cdk/constructs/unicorn-web-property-publication-construct';

describe('PropertyPublicationConstruct', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.WEB;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');

    // Create required props for the construct
    const table = new dynamodb.TableV2(stack, 'TestTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
    const api = new apigateway.RestApi(stack, 'TestApi');

    const eventBus = new events.EventBus(stack, 'TestEventBus');

    // Create the construct
    new PropertyPublicationConstruct(stack, 'TestConstruct', {
      stage,
      table,
      api,
      eventBus,
    });

    // Prepare the template for assertions
    template = Template.fromStack(stack);
  });

  test('creates SQS queues', () => {
    // Verify main queue creation
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'ApprovalRequestQueue-local',
      VisibilityTimeout: 20,
      MessageRetentionPeriod: 1209600,
      SqsManagedSseEnabled: true,
    });

    // Verify DLQ creation
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'IngestDLQ-local',
      MessageRetentionPeriod: 1209600, // 14 days
      SqsManagedSseEnabled: true,
    });
  });

  test('creates IAM role for API Gateway integration', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'UnicornWebApiIntegrationRole-local',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'apigateway.amazonaws.com',
            },
          },
        ],
      },
    });
  });

  test('creates Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);

    const functions = template.findResources('AWS::Lambda::Function');

    // Check that we have functions with expected logical IDs
    const logicalIds = Object.keys(functions);

    const requestApprovalFunction = logicalIds.find((id) =>
      id.match(/.*RequestApprovalFunction.*/)
    );
    expect(requestApprovalFunction).toBeTruthy();

    if (requestApprovalFunction) {
      const functionProps = functions[requestApprovalFunction].Properties;
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
            EVENT_BUS: expect.objectContaining({
              Ref: expect.stringContaining('TestEventBus'),
            }),
            SERVICE_NAMESPACE: serviceNamespace,
          },
        },
      });
    }

    const publicationApprovedFunction = logicalIds.find((id) =>
      id.match(/.*PublicationApprovedFunction.*/)
    );
    expect(publicationApprovedFunction).toBeTruthy();
    if (publicationApprovedFunction) {
      const functionProps = functions[publicationApprovedFunction].Properties;
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
              Ref: expect.stringContaining('Table'),
            }),
            SERVICE_NAMESPACE: serviceNamespace,
          },
        },
      });
    }
  });

  test('creates EventBridge rule', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'unicorn.web-PublicationEvaluationCompleted',
      EventPattern: {
        source: ['unicorn.properties'],
        'detail-type': ['PublicationEvaluationCompleted'],
      },
    });
  });

  test('creates API Gateway integration', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
      ResourceId: Match.objectEquals({
        Ref: Match.stringLikeRegexp('requestapproval[A-Z0-9]+'),
      }),
      RestApiId: Match.objectEquals({
        Ref: Match.stringLikeRegexp('^TestApi[A-Z0-9]+'),
      }),
      Integration: {
        IntegrationHttpMethod: 'POST',
        Type: 'AWS',
      },
    });
  });

  test('CloudWatch log groups are created with correct retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 1,
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::ApiGateway::Account', 1);
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::ApiGateway::Stage', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 1);
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::SQS::Queue', 3);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 3);
    template.resourceCountIs('AWS::IAM::Role', 4);
    template.resourceCountIs('AWS::IAM::Policy', 3);
    template.resourceCountIs('AWS::Logs::LogGroup', 2);
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
    template.resourceCountIs('AWS::Lambda::Permission', 1);
  });
});
