import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions'
import { Stage, UnicornWebStack } from '../../cdk/app/unicorn-web-stack';
import { PolicyDocument } from 'aws-cdk-lib/aws-iam';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { match } from 'assert';

describe('Unicorn Properties Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = Stage.local // use Local for testing
  const serviceNamespace = 'unicorn.web'

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornWebStack(app, 'TestStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('EventBus is created with correct properties', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: 'UnicornWebBus-local',
      Tags: [
        {
          Key: 'namespace',
          Value: 'unicorn.web'
        },
        {
          Key: 'project',
          Value: 'AWS Serverless Developer Experience'
        },
        {
          Key: 'stage',
          Value: 'local'
        }
      ]
    });
  });

  test('DynamoDB table is created with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S'
        },
        {
          AttributeName: 'SK',
          AttributeType: 'S'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      }
    });
  });

  test('API Gateway REST API is created with correct configuration', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'UnicornWebApi',
      EndpointConfiguration: {
        Types: ['REGIONAL']
      }
    });
  });

  test('Lambda functions are created with correct configurations', () => {
    // Test Search Function
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.lambdaHandler',
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          POWERTOOLS_SERVICE_NAME: 'unicorn.web',
          POWERTOOLS_METRICS_NAMESPACE: 'unicorn.web',
          LOG_LEVEL: 'INFO'
        }
      },
      TracingConfig: {
        Mode: 'Active'
      }
    });
  });

  test('SQS queues are created with correct configurations', () => {
    // Test main queue
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'WebIngestQueue-local',
      MessageRetentionPeriod: 1209600,
      VisibilityTimeout: 20
    });

    // Test DLQ
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'WebIngestDLQ-local',
      MessageRetentionPeriod: 1209600
    });
  });

  test('CloudWatch log groups are created with correct retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 1
    });
  });

  test('Correct number of Lambda functions are created', () => {
    template.resourceCountIs('AWS::Lambda::Function', 4); // Adjust the number based on your actual functions
  });

  test('EventBridge rule is created with correct pattern', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: {
        source: ['unicorn.properties'],
        'detail-type': ['PublicationEvaluationCompleted']
      },
      State: 'ENABLED'
    });
  });

  test('SSM Parameters are created for EventBus', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBus',
      Type: 'String'
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/uni-prop/local/UnicornWebEventBusArn',
      Type: 'String'
    });
  });
});