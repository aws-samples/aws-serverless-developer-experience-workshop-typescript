// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { STAGE, UNICORN_NAMESPACES } from '../../cdk/lib/helper';
import { WebPropertySearchStack } from '../../cdk/app/unicorn-web-property-search-stack';

describe('PropertySearchStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const stage = STAGE.local; // use local for testing
  const serviceNamespace = UNICORN_NAMESPACES.WEB;

  beforeEach(() => {
    // Create a new app and stack for each test
    app = new cdk.App();

    // Create the construct
    stack = new WebPropertySearchStack(app, 'TestPropertySearchStack', {
      stage,
      eventBusName: 'testEventBus',
      tableName: 'testTable',
      restApiId: 'testApiId',
      restApiRootResourceId: 'testRootResourceId',
      restApiUrl: 'https://test.local',
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
              Ref: 'uniproplocaltestTableParameter',
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

  test('creates IAM role for API Gateway integration', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'WebApiSearchIntegrationRole-local',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'apigateway.amazonaws.com',
            },
          },
        ],
      },
    });
  });

  test('creates API Gateway resources with correct structure', () => {
    // Verify API Gateway resources
    template.resourceCountIs('AWS::ApiGateway::Resource', 9); // /search + country, city and street.  /properties + country, city, street and number

    // Verify the search endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: 'uniproplocaltestRootResourceIdParameter',
      },
      PathPart: 'search',
    });

    // Verify country endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apisearch[A-Z0-9]+'),
      },
      PathPart: '{country}',
    });

    // Verify city endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apisearchcountry[A-Z0-9]+'),
      },
      PathPart: '{city}',
    });

    // Verify street endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apisearchcountrycity[A-Z0-9]+'),
      },
      PathPart: '{street}',
    });

    // Verify the properties endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: 'uniproplocaltestRootResourceIdParameter',
      },
      PathPart: 'properties',
    });

    // Verify country endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apiproperties[A-Z0-9]+'),
      },
      PathPart: '{country}',
    });

    // Verify city endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apipropertiescountry[A-Z0-9]+'),
      },
      PathPart: '{city}',
    });

    // Verify street endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apipropertiescountrycity[A-Z0-9]+'),
      },
      PathPart: '{street}',
    });
    // Verify street number endpoint
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      ParentId: {
        Ref: Match.stringLikeRegexp('Apipropertiescountrycitystreet[A-Z0-9]+'),
      },
      PathPart: '{number}',
    });
  });

  test('creates API Gateway integration', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      ResourceId: Match.objectEquals({
        Ref: Match.stringLikeRegexp('webRestApisearchcountrycity[A-Z0-9]+'),
      }),
      RestApiId: Match.objectEquals({
        Ref: 'uniproplocaltestApiIdParameter',
      }),
      Integration: {
        IntegrationHttpMethod: 'POST',
        Type: 'AWS_PROXY',
      },
    });
  });

  test('creates API Gateway methods with correct configuration', () => {
    // Verify GET methods are created
    template.resourceCountIs('AWS::ApiGateway::Method', 3); // Base search + country+city, street, property details

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
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::ApiGateway::Resource', 9);
    template.resourceCountIs('AWS::ApiGateway::Method', 3);
    template.resourceCountIs('AWS::ApiGateway::Deployment', 1);
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
    template.resourceCountIs('AWS::IAM::Role', 2);
    template.resourceCountIs('AWS::IAM::Policy', 2);
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.resourceCountIs('AWS::Lambda::Permission', 6);
  });
});
