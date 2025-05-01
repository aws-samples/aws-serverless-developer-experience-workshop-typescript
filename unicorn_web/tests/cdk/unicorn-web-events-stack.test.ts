// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { STAGE, UNICORN_NAMESPACES } from '../../cdk/lib/helper';
import { WebEventsStack } from '../../cdk/app/unicorn-web-events-stack';

describe('EventsStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.WEB;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new WebEventsStack(app, 'TestEventsStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('creates EventBridge event bus with correct properties', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: 'UnicornWebBus-local',
    });
  });

  test('creates event bus policy with correct permissions', () => {
    template.hasResourceProperties('AWS::Events::EventBusPolicy', {
      EventBusName: {
        Ref: Match.stringLikeRegexp('UnicornWebBuslocal.*'),
      },
      StatementId: 'OnlyWebServiceCanPublishToEventBus-local',
      Statement: {
        Effect: 'Allow',
        Principal: {
          AWS: {
            'Fn::Join': [
              '',
              [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':iam::',
                { Ref: 'AWS::AccountId' },
                ':root',
              ],
            ],
          },
        },
        Action: 'events:PutEvents',
        Resource: {
          'Fn::GetAtt': [Match.stringLikeRegexp('UnicornWebBus.*'), 'Arn'],
        },
        Condition: {
          StringEquals: {
            'events:source': serviceNamespace,
          },
        },
      },
    });
  });

  test('creates SSM parameters for event bus', () => {
    // Test event bus name parameter
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBus',
      Type: 'String',
      Value: {
        Ref: Match.stringLikeRegexp('UnicornWebBus.*'),
      },
    });

    // Test event bus ARN parameter
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBusArn',
      Type: 'String',
      Value: {
        'Fn::GetAtt': [Match.stringLikeRegexp('UnicornWebBus.*'), 'Arn'],
      },
    });
  });

  test('creates development logging resources when stage is local', () => {
    // Test log group creation
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/events/local/unicorn.web-catchall',
      RetentionInDays: 1,
    });

    // Test EventBridge rule for logging
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'web.catchall',
      Description: 'Catch all events published by the unicorn.web service.',
      EventBusName: {
        Ref: Match.stringLikeRegexp('UnicornWebBus.*'),
      },
      EventPattern: {
        account: [{ Ref: 'AWS::AccountId' }],
        source: ['unicorn.web'],
      },
      State: 'ENABLED',
    });
  });

  test('creates Schema Registry with correct configuration', () => {
    // Test registry creation
    template.hasResourceProperties('AWS::EventSchemas::Registry', {
      RegistryName: 'unicorn.web-local',
      Description: 'Event schemas for Unicorn Web local',
    });

    // Test schema creation
    template.hasResourceProperties('AWS::EventSchemas::Schema', {
      RegistryName: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('EventRegistry.*'),
          'RegistryName',
        ],
      },
      Type: 'OpenApi3',
      SchemaName: {
        'Fn::Join': [
          '',
          [
            {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('EventRegistry.*'),
                'RegistryName',
              ],
            },
            '@PublicationApprovalRequested',
          ],
        ],
      },
    });
  });

  test('creates Schema Registry policy with correct permissions', () => {
    template.hasResourceProperties('AWS::EventSchemas::RegistryPolicy', {
      RegistryName: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('EventRegistry.*'),
          'RegistryName',
        ],
      },
      Policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowExternalServices',
            Effect: 'Allow',
            Principal: {
              AWS: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':iam::',
                    { Ref: 'AWS::AccountId' },
                    ':root',
                  ],
                ],
              },
            },
            Action: [
              'schemas:DescribeCodeBinding',
              'schemas:DescribeRegistry',
              'schemas:DescribeSchema',
              'schemas:GetCodeBindingSource',
              'schemas:ListSchemas',
              'schemas:ListSchemaVersions',
              'schemas:SearchSchemas',
            ],
            Resource: Match.anyValue(),
          },
        ],
      },
    });
  });

  test('SSM Parameters are created for EventBus', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBus',
      Type: 'String',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBusArn',
      Type: 'String',
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Events::EventBusPolicy', 2);
    template.resourceCountIs('AWS::Events::Rule', 1);
    template.resourceCountIs('AWS::EventSchemas::Registry', 1);
    template.resourceCountIs('AWS::EventSchemas::Schema', 1);
    template.resourceCountIs('AWS::EventSchemas::RegistryPolicy', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('Custom::CloudwatchLogResourcePolicy', 1);
    template.resourceCountIs('AWS::IAM::Policy', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.resourceCountIs('AWS::SSM::Parameter', 2);
  });
});
