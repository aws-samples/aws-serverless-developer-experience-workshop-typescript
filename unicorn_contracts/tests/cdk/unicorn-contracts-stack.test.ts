// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { RetentionDays } from 'aws-cdk-lib/aws-logs';

import { STAGE, UNICORN_NAMESPACES } from '../../cdk/app/helper';
import { UnicornConstractsStack } from '../../cdk/app/unicorn-contracts-stack';

describe('Unicorn Contracts Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use Local for testing
  const serviceNamespace = UNICORN_NAMESPACES.CONTRACTS;

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornConstractsStack(app, 'TestStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('Creates SSM parameters for event bus', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: `/uni-prop/${stage}/UnicornContractsEventBusArn`,
      Value: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('.*UnicornContractsBus.*'),
          'Arn',
        ],
      },
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: `/uni-prop/${stage}/UnicornContractsEventBus`,
      Value: { Ref: Match.stringLikeRegexp('.*UnicornContractsBus.*') },
    });
  });

  test('Creates Lambda function with correct configuration', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.lambdaHandler',
      Runtime: 'nodejs20.x',
      Timeout: 15,
      TracingConfig: { Mode: 'Active' },
      Environment: {
        Variables: {
          DYNAMODB_TABLE: {
            Ref: Match.stringLikeRegexp('.*ContractsTable.*'),
          },
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_TRACE_DISABLED: 'false',
          POWERTOOLS_LOGGER_LOG_EVENT: Match.anyValue(),
          POWERTOOLS_LOGGER_SAMPLE_RATE: Match.anyValue(),
          LOG_LEVEL: 'INFO',
        },
      },
    });
  });

  // test('Creates API Gateway with correct configuration', () => {
  //   template.hasResourceProperties('AWS::Serverless::Api', {
  //     StageName: Match.anyValue(),
  //     EndpointConfiguration: {
  //       Type: 'REGIONAL'
  //     },
  //     TracingEnabled: true,
  //     MethodSettings: [
  //       {
  //         MetricsEnabled: true,
  //         ResourcePath: '/*',
  //         HttpMethod: '*',
  //         ThrottlingBurstLimit: 10,
  //         ThrottlingRateLimit: 100
  //       }
  //     ]
  //   });
  // });

  test('Creates Ingest SQS queue with correct configuration', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: Match.stringLikeRegexp(`UnicornContractsIngestQueue-${stage}`),
      SqsManagedSseEnabled: true,
      MessageRetentionPeriod: 1209600,
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': [
            Match.stringLikeRegexp('.*UnicornContractsIngestDLQ.*'),
            'Arn',
          ],
        },
        maxReceiveCount: 1,
      },
      VisibilityTimeout: 20,
    });

    // DLQ
    template.hasResourceProperties('AWS::SQS::Queue', {
      SqsManagedSseEnabled: true,
      MessageRetentionPeriod: 1209600,
      QueueName: `UnicornContractsIngestDLQ-${stage}`,
    });
  });

  test('Creates DLQ for EventBridge Pipe with correct configuration', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: Match.stringLikeRegexp(
        `ContractsTableStreamToEventPipeDLQ-${stage}`
      ),
      SqsManagedSseEnabled: true,
      MessageRetentionPeriod: 1209600,
    });
  });

  test('Creates DynamoDB table with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      TableName: `uni-prop-${stage}-contracts-ContractsTable`,
      AttributeDefinitions: [
        {
          AttributeName: 'property_id',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'property_id',
          KeyType: 'HASH',
        },
      ],
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('Creates a Catch All CloudWatch Log Group with the correct configuration', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: Match.stringLikeRegexp(
        `/aws/events/${stage}/${serviceNamespace}-catchall`
      ),
      RetentionInDays: RetentionDays.ONE_DAY, // Retention for local stage is One day
    });
  });

  test('Creates EventBridge resources with correct configuration', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: Match.stringLikeRegexp(`UnicornContractsBus-${stage}`),
    });

    template.hasResourceProperties('AWS::Events::EventBusPolicy', {
      StatementId: `OnlyContractsServiceCanPublishToEventBus-${stage}`,
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
          'Fn::GetAtt': [
            Match.stringLikeRegexp('.*UnicornContractsBus.*'),
            'Arn',
          ],
        },
        Condition: {
          StringEquals: {
            'events:source': serviceNamespace,
          },
        },
      },
    });

    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'contracts.catchall',
      Description: 'Catch all events published by the Contracts service.',
      EventPattern: {
        account: [{ Ref: 'AWS::AccountId' }],
        source: [serviceNamespace],
      },
      State: 'ENABLED',
      Targets: [
        {
          Arn: {
            'Fn::Join': [
              '',
              [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':logs:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':log-group:',
                {
                  Ref: Match.stringLikeRegexp('.*CatchAllLogGroup.*'),
                },
              ],
            ],
          },
        },
      ],
    });
  });

  test('Creates EventBridge Pipe with correct configuration', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Condition: {
              StringEquals: {
                'aws:SourceAccount': { Ref: 'AWS::AccountId' },
              },
            },
            Effect: 'Allow',
            Principal: {
              Service: 'pipes.amazonaws.com',
            },
          },
        ],
      }),
    });

    template.hasResourceProperties('AWS::Pipes::Pipe', {
      SourceParameters: {
        DynamoDBStreamParameters: {
          MaximumRetryAttempts: 3,
          BatchSize: 1,
          StartingPosition: 'LATEST',
        },
        FilterCriteria: {
          Filters: [
            {
              Pattern: Match.stringLikeRegexp(
                '.*"eventName".*"INSERT".*"MODIFY".*"contract_status".*"DRAFT".*"APPROVED".*'
              ),
            },
          ],
        },
      },
      LogConfiguration: {
        CloudwatchLogsLogDestination: {
          LogGroupArn: Match.objectLike({
            'Fn::GetAtt': [
              Match.stringLikeRegexp(
                '.*ContractsTableStreamToEventPipeLogGroup.*'
              ),
              'Arn',
            ],
          }),
        },
        Level: 'ERROR',
      },
      TargetParameters: {
        EventBridgeEventBusParameters: {
          DetailType: 'ContractStatusChanged',
          Source: serviceNamespace,
        },
      },
    });

    // test('Has correct outputs', () => {
    //   template.hasOutput('BaseUrl', {
    //     Description: 'Web service API endpoint',
    //     Value: {
    //       'Fn::Sub': Match.stringLikeRegexp('https://.*.execute-api.*.amazonaws.com')
    //     }
    //   });

    //   template.hasOutput('ApiUrl', {
    //     Description: 'Contract service API endpoint',
    //     Value: {
    //       'Fn::Sub': Match.stringLikeRegexp('https://.*.execute-api.*.amazonaws.com/.*/')
    //     }
    //   });
  });
});
