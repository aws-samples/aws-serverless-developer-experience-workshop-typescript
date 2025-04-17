// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as events from 'aws-cdk-lib/aws-events';

import { STAGE, UNICORN_NAMESPACES } from '../../cdk/constructs/helper';
import { PropertiesToWebIntegrationStack } from '../../cdk/app/unicorn-properties-integration-with-web-stack';

describe('PropertiesToWebIntegrationStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let propertiesEventBus: events.EventBus;

  const stage = STAGE.local; // use local for testing

  beforeEach(() => {
    app = new cdk.App();
    const resourceStack = new cdk.Stack(app, 'ResourceStack');
    propertiesEventBus = new events.EventBus(
      resourceStack,
      'TestPropertiesEventBus',
      {
        eventBusName: 'TestPropertiesEventBus',
      }
    );
    stack = new PropertiesToWebIntegrationStack(app, 'TestStack', {
      // env required as Construct expects to look up SSM Parameters
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stage,
      propertiesEventBus,
      webEventBusArnParam: `/uni-prop/${stage}/UnicornWebEventBusArn`,
    });

    propertiesEventBus = new events.EventBus(stack, 'TestPropertiesEventBus', {
      eventBusName: 'TestPropertiesEventBus',
    });

    template = Template.fromStack(stack);
  });

  test('stack has required tags', () => {
    expect(stack.tags.tagValues()).toEqual({
      namespace: UNICORN_NAMESPACES.PROPERTIES,
      stage: stage,
      project: 'AWS Serverless Developer Experience',
    });
  });

  test('IAM Role has correct tags', () => {
    template.hasResource('AWS::IAM::Role', {
      Properties: {
        Tags: [
          {
            Key: 'namespace',
            Value: UNICORN_NAMESPACES.PROPERTIES,
          },
          {
            Key: 'project',
            Value: 'AWS Serverless Developer Experience',
          },
          {
            Key: 'stage',
            Value: stage,
          },
        ],
      },
    });
  });

  test('constructs are properly connected', () => {
    // Test that the EventBridge rule targets the correct event bus
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: {
        source: [UNICORN_NAMESPACES.WEB],
        'detail-type': ['PublicationApprovalRequested'],
      },
      Targets: [
        Match.objectLike({
          Arn: {
            'Fn::Join': [
              '',
              [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':events:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':event-bus/TestPropertiesEventBus',
              ],
            ],
          },
        }),
      ],
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::IAM::Policy', 1);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::Rule', 1);
  });
});
