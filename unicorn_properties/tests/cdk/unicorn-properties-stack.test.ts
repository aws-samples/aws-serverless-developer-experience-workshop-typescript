import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions'


import { Stage, UNICORN_NAMESPACES } from '../../cdk/app/helper';
import { UnicornPropertiesStack } from '../../cdk/app/unicorn-properties-stack';

describe('Unicorn Properties Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = Stage.local // use Local for testing
  const serviceNamespace = UNICORN_NAMESPACES.PROPERTIES

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornPropertiesStack(app, 'TestStack', {
      stage,
    });
    template = Template.fromStack(stack);
  });

  test('EventBus is created with correct properties', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: 'UnicornPropertiesBus-local',
      Tags: [
        {
          Key: 'namespace',
          Value: serviceNamespace
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
          AttributeName: 'property_id',
          AttributeType: 'S'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'property_id',
          KeyType: 'HASH'
        }
      ],
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      }
    });
  });

  test('Lambda functions are created with correct configurations', () => {
    // Test Contract Event Handler Lambda
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.lambdaHandler',
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          CONTRACT_STATUS_TABLE: {
            Ref: Match.stringLikeRegexp('.*ContractStatusTable.*')
          },
          EVENT_BUS: {
            Ref: Match.stringLikeRegexp('.*UnicornPropertiesBus.*')
          },
          SERVICE_NAMESPACE: serviceNamespace,
          POWERTOOLS_SERVICE_NAME: serviceNamespace,
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_TRACE_DISABLED: 'false',
          POWERTOOLS_LOGGER_LOG_EVENT: Match.anyValue(),
          POWERTOOLS_LOGGER_SAMPLE_RATE: Match.anyValue(),
          LOG_LEVEL: 'INFO'
        }
      }
    });
  });

  test('EventBridge rules are created correctly', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Description: 'Catch all events published by the Properties service.',
      EventPattern: {
        source: [serviceNamespace]
      },
      State: 'ENABLED'
    });
  });

  test('SSM Parameters are created', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: '/uni-prop/local/UnicornPropertiesEventBus'
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: '/uni-prop/local/UnicornPropertiesEventBusArn'
    });
  });

  test('Dead Letter Queues are created', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      MessageRetentionPeriod: 1209600,
      QueueName: 'PropertiesEventBusRuleDLQ-local'
    });

    template.hasResourceProperties('AWS::SQS::Queue', {
      MessageRetentionPeriod: 1209600,
      QueueName: 'PropertiesServiceDLQ-local'
    });
  });

  test('Resource count matches expected', () => {
    // Verify the number of resources created
    template.resourceCountIs('AWS::Lambda::Function', 6); // Adjust number based on your functions
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::SQS::Queue', 2);
    template.resourceCountIs('AWS::SSM::Parameter', 2);
  });

});