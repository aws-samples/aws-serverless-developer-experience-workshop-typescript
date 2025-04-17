// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as events from 'aws-cdk-lib/aws-events';
import { STAGE, UNICORN_NAMESPACES } from '../../../cdk/constructs/helper';
import { crossUniPropServiceSubscriptionConstruct } from '../../../cdk/constructs/unicorn-properties-service-subscription-construct';

describe('crossUniPropServiceSubscription', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let subscriberEventBus: events.EventBus;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack', {
      // env required as Construct expects to look up SSM Parameters
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Create a subscriber event bus for testing
    subscriberEventBus = new events.EventBus(stack, 'SubscriberEventBus', {
      eventBusName: 'TestSubscriberBus',
    });

    // Create the subscription construct
    new crossUniPropServiceSubscriptionConstruct(stack, 'TestSubscription', {
      publisherEventBusArnParam: '/uni-prop/local/PublisherEventBusArn',
      subscriptionRuleName: 'TestSubscriptionRule',
      subscriptionDescription: 'Test subscription rule for unit tests',
      subscriptionEventPattern: {
        source: [UNICORN_NAMESPACES.PROPERTIES],
        detailType: ['PublicationEvaluationCompleted'],
      },
      subscriberEventBus: subscriberEventBus,
    });

    template = Template.fromStack(stack);
  });

  test('creates EventBridge rule with correct properties', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'TestSubscriptionRule',
      Description: 'Test subscription rule for unit tests',
      EventPattern: {
        source: ['unicorn.properties'],
        'detail-type': ['PublicationEvaluationCompleted'],
      },
      State: 'ENABLED',
      Targets: [
        {
          Arn: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp('SubscriberEventBus.*'),
              'Arn',
            ],
          },
          Id: Match.anyValue(),
        },
      ],
    });
  });

  test('references publisher event bus from SSM parameter', () => {
    // Verify the event bus reference is created from SSM parameter
    template.hasResourceProperties('AWS::Events::Rule', {
      EventBusName: {
        'Fn::Select': [
          1,
          {
            'Fn::Split': [
              '/',
              {
                'Fn::Select': [
                  5,
                  {
                    'Fn::Split': [
                      ':',
                      'dummy-value-for-/uni-prop/local/PublisherEventBusArn',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
  });

  test('creates correct IAM role and policy for event forwarding', () => {
    // Verify IAM role creation
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'events.amazonaws.com',
            },
          },
        ],
        Version: '2012-10-17',
      },
    });

    // Verify IAM policy for event forwarding
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'events:PutEvents',
            Effect: 'Allow',
            Resource: {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('SubscriberEventBus.*'),
                'Arn',
              ],
            },
          },
        ],
        Version: '2012-10-17',
      },
    });
  });

  test('handles SSM parameter lookup correctly', () => {
    template.hasParameter(
      '*',
      Match.objectLike({
        Type: 'AWS::SSM::Parameter::Value<String>',
      })
    );
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::IAM::Policy', 1);
  });
});
