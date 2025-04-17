// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { STAGE } from '../../../cdk/constructs/helper';
import { ApiConstruct } from '../../../cdk/constructs/unicorn-web-api-construct';

describe('ApiConstruct', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let api: ApiConstruct;

  const stage = STAGE.local; // use local for testing

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');

    // Create construct within the test stack
    api = new ApiConstruct(stack, 'TestApiConstruct', {
      stage,
    });

    // cannot create RestApi without at least one method
    const testResource = api.api.root.addResource('test');
    testResource.addMethod('GET');

    template = Template.fromStack(stack);
  });

  test('creates REST API with correct properties', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: Match.stringLikeRegexp('UnicornWebApi.*'),
      EndpointConfiguration: {
        Types: ['REGIONAL'],
      },
    });
  });

  test('creates CloudWatch log group with correct properties', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 1,
    });
  });

  test('creates API Gateway deployment stage with correct properties', () => {
    template.hasResourceProperties('AWS::ApiGateway::Stage', {
      StageName: 'local',
      TracingEnabled: true,
      MethodSettings: [
        {
          DataTraceEnabled: true,
          HttpMethod: '*',
          MetricsEnabled: true,
          ResourcePath: '/*',
        },
        {
          DataTraceEnabled: false,
          HttpMethod: '*',
          LoggingLevel: 'INFO',
          ResourcePath: '/*',
        },
      ],
      AccessLogSetting: {
        DestinationArn: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('.*UnicornWebApiLogGroup.*'),
            'Arn',
          ],
        },
        Format: Match.anyValue(),
      },
    });
  });

  test('creates CloudWatch role with correct permissions', () => {
    // Test IAM role creation
    template.hasResourceProperties('AWS::IAM::Role', {
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
        Version: '2012-10-17',
      },
      ManagedPolicyArns: [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs',
            ],
          ],
        },
      ],
    });

    // Verify role removal policy
    template.hasResource('AWS::IAM::Role', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::ApiGateway::Account', 1);
    template.resourceCountIs('AWS::ApiGateway::Stage', 1);
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 1);
    template.resourceCountIs('AWS::ApiGateway::Method', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
});
