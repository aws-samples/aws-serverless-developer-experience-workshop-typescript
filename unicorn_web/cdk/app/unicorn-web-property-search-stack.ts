// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

import {
  getDefaultLogsRetentionPeriod,
  LambdaHelper,
  StackHelper,
  STAGE,
  UNICORN_NAMESPACES,
} from '../lib/helper';

/**
 * Properties for the WebPropertySearchStack
 * @interface WebPropertySearchStackProps
 */
interface WebPropertySearchStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** Name of SSM Parameter that holds the EventBus for this service */
  eventBusName: string;
  /** Name of SSM Parameter that holds the DynamoDB table tracking property status. */
  tableName: string;
  /** Name of SSM Parameter that holds the RestApId of Web service's Rest Api */
  restApiId: string;
  /** Name of SSM Parameter that holds the RootResourceId of Web service's Rest Api */
  restApiRootResourceId: string;
  /** Name of SSM Parameter that holds the Url of Web service's Rest Api */
  restApiUrl: string;
}

/**
 * Stack that defines the Unicorn Web infrastructure
 * @class WebPropertySearchStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new WebPropertySearchStack(app, 'WebPropertySearchStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class WebPropertySearchStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new WebPropertySearchStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - DynamoDB table for data storage
   * - API Gateway REST API
   * - EventBridge event bus
   * - Property publication Construct
   * - Property eventing Construct
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: WebPropertySearchStackProps) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.WEB,
      stage: this.stage,
    });

    /**
     * Import resources based on details from SSM Parameter Store
     * Create CDK references to these existing resources.
     */
    const table = dynamodb.TableV2.fromTableName(
      this,
      'webTable',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.tableName}`
      )
    );

    const apiUrl = StackHelper.lookupSsmParameter(
      this,
      `/uni-prop/${props.stage}/${props.restApiUrl}`
    );

    const api = apigateway.RestApi.fromRestApiAttributes(this, 'webRestApi', {
      restApiId: StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.restApiId}`
      ),
      rootResourceId: StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.restApiRootResourceId}`
      ),
    });

    /* -------------------------------------------------------------------------- */
    /*                              LAMBDA FUNCTION                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * Lambda function handling property search requests
     * Processes both search queries and property detail retrievals
     */
    const searchFunction = new nodejs.NodejsFunction(
      this,
      `SearchFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/search_service/propertySearchFunction.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.WEB,
          }),
        },
        /**
         * CloudWatch log group for the search function
         * Configured with stage-appropriate retention period
         */
        logGroup: new logs.LogGroup(this, 'PropertySearchFunctionLogs', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }),
      }
    );
    // Grant read access to DynamoDB table
    table.grantReadData(searchFunction);

    /**
     * CloudFormation outputs for Lambda function details
     * Useful for cross-stack references and operational monitoring
     */
    StackHelper.createOutput(this, {
      name: 'searchFunctionName',
      value: searchFunction.functionName,
      stage: props.stage,
    });
    StackHelper.createOutput(this, {
      name: 'searchFunctionArn',
      value: searchFunction.functionArn,
      stage: props.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                           API GATEWAY RESOURCES                              */
    /* -------------------------------------------------------------------------- */

    const apiIntegrationRole = new iam.Role(
      this,
      'WebApiSearchIntegrationRole',
      {
        roleName: `WebApiSearchIntegrationRole-${props.stage}`,
        assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      }
    );
    searchFunction.grantInvoke(apiIntegrationRole);

    /**
     * Base search endpoint
     * Handles general property search requests
     * Path: GET /search
     * Returns: List of all properties
     */
    const searchResource = api.root.addResource('search', {
      defaultIntegration: new apigateway.LambdaIntegration(searchFunction, {
        credentialsRole: apiIntegrationRole,
      }),
    });

    /**
     * CloudFormation output for base search endpoint
     * Provides URL for general property searches
     */
    StackHelper.createOutput(this, {
      name: 'ApiSearchProperties',
      description: 'GET request to list all properties in a given city',
      value: `${apiUrl}search`,
      stage: props.stage,
    });

    /**
     * Country-level search endpoint
     * Enables searching properties by country
     * Path: GET /search/{country}
     */
    const listPropertiesByCountry = searchResource.addResource('{country}');

    /**
     * City-level search endpoint
     * Enables searching properties by city within a country
     * Path: GET /search/{country}/{city}
     */
    const listPropertiesByCity = listPropertiesByCountry.addResource('{city}');
    listPropertiesByCity.addMethod(
      'GET',
      new apigateway.LambdaIntegration(searchFunction, {
        credentialsRole: apiIntegrationRole,
      }),
      {
        requestParameters: {
          'method.request.path.country': true,
          'method.request.path.city': true,
        },
        methodResponses: [
          {
            statusCode: '200',
            responseModels: {
              'application/json': apigateway.Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    /**
     * CloudFormation output for city search endpoint
     * Provides URL for city-specific property searches
     */
    new cdk.CfnOutput(this, 'ApiSearchPropertiesByCity', {
      key: 'ApiSearchPropertiesByCity',
      description: 'GET request to list all properties in a given city',
      value: `${apiUrl}search/{country}/{city}`,
    });

    /**
     * Street-level search endpoint
     * Enables searching properties by street within a city
     * Path: GET /search/{country}/{city}/{street}
     */
    const listPropertiesByStreet = listPropertiesByCity.addResource('{street}');
    listPropertiesByStreet.addMethod('GET');

    /**
     * CloudFormation output for street search endpoint
     * Provides URL for street-specific property searches
     */
    new cdk.CfnOutput(this, 'ApiSearchPropertiesByStreet', {
      key: 'ApiSearchPropertiesByStreet',
      description: 'GET request to list all properties in a given street',
      value: `${apiUrl}search/{country}/{city}/{street}`,
    });

    /* -------------------------------------------------------------------------- */
    /*                         PROPERTY DETAILS ENDPOINTS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Property details resource hierarchy
     * Enables retrieving specific property details by address
     * Base path: /properties
     */
    const propertiesResource = api.root.addResource('properties');
    const propertyByCountry = propertiesResource.addResource('{country}');
    const propertyByCity = propertyByCountry.addResource('{city}');
    const propertyByStreet = propertyByCity.addResource('{street}');

    /**
     * Individual property endpoint
     * Retrieves detailed information for a specific property
     * Path: GET /properties/{country}/{city}/{street}/{number}
     */
    propertyByStreet
      .addResource('{number}', {
        defaultIntegration: new apigateway.LambdaIntegration(searchFunction),
      })
      .addMethod('GET');
    /**
     * CloudFormation output for property details endpoint
     * Provides URL for retrieving specific property details
     */
    new cdk.CfnOutput(this, 'ApiPropertyDetails', {
      key: 'ApiPropertyDetails',
      description: 'GET request to get the full details of a single property',
      value: `${apiUrl}properties/{country}/{city}/{street}/{number}`,
    });

    const deployment = new apigateway.Deployment(this, 'deployment', {
      api: api,
      stageName: props.stage,
    });
    deployment.node.addDependency(
      propertiesResource,
      propertyByCountry,
      propertyByCity,
      propertyByStreet
    );
    deployment.node.addDependency(
      searchResource,
      listPropertiesByCountry,
      listPropertiesByCity,
      listPropertiesByStreet
    );
  }
}
