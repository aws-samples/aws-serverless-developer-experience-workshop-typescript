// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';

import {
  LambdaHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from './helper';

/**
 * Properties for the PropertySearchConstruct construct
 * @interface PropertySearchConstructProps
 */
interface PropertySearchConstructProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** DynamoDB table for property data storage */
  table: dynamodb.TableV2;
  /** REST API Gateway instance */
  api: apigateway.RestApi;
}

/**
 * Construct that defines the Property Search infrastructure
 * Handles property search and retrieval functionality
 * @class PropertySearchConstruct
 *
 * @example
 * ```typescript
 * const searchConstruct = new PropertySearchConstruct(stack, 'PropertySearchConstruct', {
 *   stage: STAGE.dev,
 *   table: myDynamoTable,
 *   api: myApiGateway
 * });
 * ```
 */
export class PropertySearchConstruct extends Construct {
  /**
   * Creates a new PropertySearchConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - Lambda function for property search
   * - API Gateway endpoints for search operations
   * - Associated IAM roles and permissions
   * - CloudFormation outputs for API endpoints
   */
  constructor(
    scope: Construct,
    id: string,
    props: PropertySearchConstructProps
  ) {
    super(scope, id);

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
            table: props.table,
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
    props.table.grantReadData(searchFunction);

    /**
     * CloudFormation outputs for Lambda function details
     * Useful for cross-stack references and operational monitoring
     */
    new cdk.CfnOutput(this, 'searchFunctionName', {
      exportName: 'SearchFunctionName',
      value: searchFunction.functionName,
    });
    new cdk.CfnOutput(this, 'searchFunctionArn', {
      exportName: 'SearchFunctionArn',
      value: searchFunction.functionArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                           API GATEWAY RESOURCES                              */
    /* -------------------------------------------------------------------------- */

    /**
     * Base search endpoint
     * Handles general property search requests
     * Path: GET /search
     * Returns: List of all properties
     */
    const searchResource = props.api.root.addResource('search', {
      defaultIntegration: new apigateway.LambdaIntegration(searchFunction),
    });
    /**
     * CloudFormation output for base search endpoint
     * Provides URL for general property searches
     */
    new cdk.CfnOutput(this, 'ApiSearchProperties', {
      exportName: 'ApiSearchProperties',
      description: 'GET request to list all properties in a given city',
      value: `${props.api.url}search`,
    });

    /**
     * Country-level search endpoint
     * Enables searching properties by country
     * Path: GET /search/{country}
     */
    const listPropertiesByCountry = searchResource.addResource('{country}');
    listPropertiesByCountry.addMethod('GET');
    /**
     * City-level search endpoint
     * Enables searching properties by city within a country
     * Path: GET /search/{country}/{city}
     */
    const listPropertiesByCity = listPropertiesByCountry.addResource('{city}');
    listPropertiesByCity.addMethod('GET');
    /**
     * CloudFormation output for city search endpoint
     * Provides URL for city-specific property searches
     */
    new cdk.CfnOutput(this, 'ApiSearchPropertiesByCity', {
      exportName: 'ApiSearchPropertiesByCity',
      description: 'GET request to list all properties in a given city',
      value: `${props.api.url}search/{country}/{city}`,
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
      exportName: 'ApiSearchPropertiesByStreet',
      description: 'GET request to list all properties in a given street',
      value: `${props.api.url}search/{country}/{city}/{street}`,
    });

    /* -------------------------------------------------------------------------- */
    /*                         PROPERTY DETAILS ENDPOINTS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Property details resource hierarchy
     * Enables retrieving specific property details by address
     * Base path: /properties
     */
    const propertiesResource = props.api.root.addResource('properties');
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
      exportName: 'ApiPropertyDetails',
      description: 'GET request to get the full details of a single property',
      value: `${props.api.url}properties/{country}/{city}/{street}/{number}`,
    });
  }
}
