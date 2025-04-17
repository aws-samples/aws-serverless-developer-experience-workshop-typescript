// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import {
  STAGE,
  UNICORN_NAMESPACES,
} from '../../cdk/constructs/helper';
import { UnicornPropertiesStack } from '../../cdk/app/unicorn-properties-stack';

describe('Unicorn Properties Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use Local for testing
  const serviceNamespace = UNICORN_NAMESPACES.PROPERTIES;

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornPropertiesStack(app, 'TestStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('stack has required tags', () => {
    expect(stack.tags.tagValues()).toEqual({
      namespace: serviceNamespace,
      stage: stage,
      project: 'AWS Serverless Developer Experience',
    });
  });

  test('Resource count matches expected', () => {
    // Verify the number of resources created

    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::Events::Rule', 3);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::EventBusPolicy', 2);
    template.resourceCountIs('AWS::IAM::Role', 6);
    template.resourceCountIs('AWS::IAM::Policy', 6);
    template.resourceCountIs('AWS::Lambda::Function', 4);
    template.resourceCountIs('AWS::Lambda::Permission', 1);
    template.resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 5);
    template.resourceCountIs('AWS::SSM::Parameter', 2);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
    template.resourceCountIs('AWS::SQS::Queue', 3);
    template.resourceCountIs('AWS::SQS::QueuePolicy', 2);
    template.resourceCountIs('Custom::CloudwatchLogResourcePolicy', 1);
  });
});
