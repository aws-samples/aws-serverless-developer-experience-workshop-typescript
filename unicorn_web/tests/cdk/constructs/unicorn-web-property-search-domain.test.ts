// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { STAGE, UNICORN_NAMESPACES } from '../../../cdk/constructs/helper';
import { PropertySearchDomain } from '../../../cdk/constructs/unicorn-web-property-search-domain';

describe('PropertySearchDomain', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let table: dynamodb.TableV2;
  let api: apigateway.RestApi;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.WEB;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');

    // Create the required dependencies
    table = new dynamodb.TableV2(stack, 'TestTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    api = new apigateway.RestApi(stack, 'TestApi', {
      restApiName: 'TestApi',
    });

    // Create the construct
    new PropertySearchDomain(stack, 'TestPropertySearchDomain', {
      stage,
      table,
      api,
    });

    // Prepare the template for assertions
    template = Template.fromStack(stack);
  });

  test('creates search Lambda function with correct properties', () => {
    // Verify Lambda function count
    template.resourceCountIs('AWS::Lambda::Function', 1);

    // Find the search function and verify its properties
    const functions = template.findResources('AWS::Lambda::Function');
    const logicalIds = Object.keys(functions);

    const searchFunctionId = logicalIds.find((id) =>
      id.match(/SearchFunction/)
    );
    expect(searchFunctionId).toBeDefined();

    if (searchFunctionId) {
      const functionProps = functions[searchFunctionId].Properties;
      expect(functionProps).toMatchObject({
        Handler: 'index.lambdaHandler',
        Runtime: 'nodejs20.x',
        Timeout: 15,
        MemorySize: 128,
        TracingConfig: {
          Mode: 'Active',
        },
        Environment: {
          Variables: {
            DYNAMODB_TABLE: expect.objectContaining({
              Ref: expect.stringContaining('TestTable'),
            }),
            SERVICE_NAMESPACE: serviceNamespace,
            POWERTOOLS_SERVICE_NAME: serviceNamespace,
            POWERTOOLS_METRICS_NAMESPACE: serviceNamespace,
            LOG_LEVEL: 'INFO',
          },
        },
      });
    }
  });

  test('creates API Gateway resources with correct structure', () => {
    // Verify API Gateway resources
    template.resourceCountIs('AWS::ApiGateway::Resource', 9); // /search + country, city and street.  /properties + country, city, street and number

    // Verify the search endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('TestApi[A-Z0-9]+'),
          'RootResourceId',
        ],
      },
      PathPart: 'search',
    });

    // Verify country endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApisearch[A-Z0-9]+'),
      },
      PathPart: '{country}',
    });

    // Verify city endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApisearchcountry[A-Z0-9]+'),
      },
      PathPart: '{city}',
    });

    // Verify street endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApisearchcountrycity[A-Z0-9]+'),
      },
      PathPart: '{street}',
    });

    // Verify the properties endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('TestApi[A-Z0-9]+'),
          'RootResourceId',
        ],
      },
      PathPart: 'properties',
    });

    // Verify country endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApiproperties[A-Z0-9]+'),
      },
      PathPart: '{country}',
    });

    // Verify city endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApipropertiescountry[A-Z0-9]+'),
      },
      PathPart: '{city}',
    });

    // Verify street endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('TestApipropertiescountrycity[A-Z0-9]+'),
      },
      PathPart: '{street}',
    });
    // Verify street number endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp(
          'TestApipropertiescountrycitystreet[A-Z0-9]+'
        ),
      },
      PathPart: '{number}',
    });
  });

  test('creates API Gateway methods with correct configuration', () => {
    // Verify GET methods are created
    template.resourceCountIs('AWS::ApiGateway::Method', 4); // Base search + country, city, street, property details

    // Verify method properties
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      AuthorizationType: 'NONE',
      Integration: {
        Type: 'AWS_PROXY',
        IntegrationHttpMethod: 'POST',
      },
    });
  });

  test('creates CloudWatch log group with correct properties', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 1,
    });
  });

  test('configures correct resource count', () => {
    template.resourceCountIs('AWS::DynamoDB::GlobalTable', 1);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::ApiGateway::Account', 1);
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::ApiGateway::Stage', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 9);
    template.resourceCountIs('AWS::ApiGateway::Method', 4);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::IAM::Role', 2);
    template.resourceCountIs('AWS::IAM::Policy', 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.resourceCountIs('AWS::Lambda::Permission', 8);
  });
});
