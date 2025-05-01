// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { STAGE, UNICORN_NAMESPACES } from '../../cdk/lib/helper';
import { WebToPropertiesIntegrationStack } from '../../cdk/app/unicorn-web-integration-with-properties-stack';

describe('UnicornWebIntegrationWithPropertiesStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use local for testing

  beforeEach(() => {
    app = new cdk.App();

    stack = new WebToPropertiesIntegrationStack(app, 'TestStack', {
      // env required as Construct expects to look up SSM Parameters
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
      stage,
      eventBusNameParameter: `/uni-prop/${stage}/UnicornWebEventBusArn`,
      propertiesEventBusArnParam: `/uni-prop/${stage}/UnicornPropertiesEventBusArn`,
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

  test('IAM Role has correct tags', () => {
    template.hasResource('AWS::IAM::Role', {
      Properties: {
        Tags: [
          {
            Key: 'namespace',
            Value: UNICORN_NAMESPACES.WEB,
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
        source: [UNICORN_NAMESPACES.PROPERTIES],
        'detail-type': ['PublicationEvaluationCompleted'],
      },
      Targets: [
        Match.objectLike({
          Arn: {
            'Fn::Join': [
              '',
              [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':events:us-east-1:123456789012:event-bus/',
                {
                  Ref: 'uniproplocaluniproplocalUnicornWebEventBusArnParameter',
                },
              ],
            ],
          },
        }),
      ],
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::IAM::Policy', 1);
  });
});
