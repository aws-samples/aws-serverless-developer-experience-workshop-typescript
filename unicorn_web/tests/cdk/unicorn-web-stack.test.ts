// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { STAGE, UNICORN_NAMESPACES } from '../../cdk/constructs/helper';
import { UnicornWebStack } from '../../cdk/app/unicorn-web-stack';

describe('Unicorn Web Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use Local for testing

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornWebStack(app, 'TestStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('stack has required tags', () => {
    expect(stack.tags.tagValues()).toEqual({
      namespace: UNICORN_NAMESPACES.WEB,
      stage: stage,
      project: 'AWS Serverless Developer Experience',
    });
  });

  test('DynamoDB table is created with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      TableName: `uni-prop-${stage}-web-WebTable`,
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'SK',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::ApiGateway::Account', 1);
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::ApiGateway::Stage', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 10);
    template.resourceCountIs('AWS::ApiGateway::Method', 5);
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::Events::Rule', 2);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::EventBusPolicy', 2);
    template.resourceCountIs('AWS::EventSchemas::Registry', 1);
    template.resourceCountIs('AWS::EventSchemas::RegistryPolicy', 1);
    template.resourceCountIs('AWS::EventSchemas::Schema', 1);
    template.resourceCountIs('AWS::IAM::Role', 6);
    template.resourceCountIs('AWS::IAM::Policy', 5);
    template.resourceCountIs('AWS::Lambda::Function', 4);
    template.resourceCountIs('AWS::Lambda::Permission', 9);
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 5);
    template.resourceCountIs('AWS::SSM::Parameter', 2);
    template.resourceCountIs('AWS::SQS::Queue', 3);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 3);
    template.resourceCountIs('Custom::CloudwatchLogResourcePolicy', 1);
  });
});
