// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';

import {
  getDefaultLogsRetentionPeriod,
  StackHelper,
  STAGE,
  UNICORN_NAMESPACES,
} from '../lib/helper';

/**
 * Properties for the WebApiStack
 * @interface WebApiStackProps
 */
interface WebApiStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Stack that defines the Unicorn Web API infrastructure
 * @class WebApiStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new WebApiStack(app, 'WebApiStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class WebApiStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;
  /** Name of SSM Parameter that holds the DynamoDB table tracking property status. */
  public webTableNameParameter: string;
  /** Name of SSM Parameter that holds the RestApId of Web service's Rest Api */
  public webRestApiIdParameter: string;
  /** Name of SSM Parameter that holds the RootResourceId of Web service's Rest Api */
  public webApiRootResourceIdParameter: string;
  /** Name of SSM Parameter that holds the Url of Web service's Rest Api */
  public webApiUrlParameter: string;

  /**
   * Creates a new WebApiStack
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
  constructor(scope: cdk.App, id: string, props: WebApiStackProps) {
    super(scope, id, props);
    this.stage = props.stage;
    this.webTableNameParameter = 'UnicornWebTableName';
    this.webRestApiIdParameter = 'UnicornWebRestApiId';
    this.webApiRootResourceIdParameter = 'UnicornWebRestApiRootResourceId';
    this.webApiUrlParameter = 'UnicornWebRestApiUrl';

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.WEB,
      stage: this.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                                  STORAGE                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * DynamoDB table for storing web application data
     * Uses a composite key (PK/SK) design pattern for flexible querying
     * Includes stream configuration for change data capture
     */
    const table = new dynamodb.TableV2(this, `WebTable`, {
      tableName: `uni-prop-${this.stage}-WebTable`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // be careful with this in production
    });
    /**
     * CloudFormation output exposing the DynamoDB table name
     * Useful for cross-stack references and operational visibility
     */
    StackHelper.createOutput(this, {
      name: this.webTableNameParameter,
      description: 'DynamoDB table storing property information',
      value: table.tableName,
      stage: props.stage,
      createSsmStringParameter: true,
    });

    /* -------------------------------------------------------------------------- */
    /*                              API GATEWAY                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * CloudWatch log group for API Gateway access logs
     * Configured with stage-appropriate retention period and removal policy
     */
    const apiLogGroup = new logs.LogGroup(this, 'UnicornWebApiLogGroup', {
      retention: getDefaultLogsRetentionPeriod(props.stage),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * REST API Gateway instance
     * Handles all HTTP requests for the Unicorn Web application
     *
     * Configuration includes:
     * - CloudWatch role for logging
     * - Stage-specific deployment options
     * - Access logging to CloudWatch
     * - Stage-appropriate logging levels
     * - Regional endpoint type
     */
    const api = new apigateway.RestApi(this, 'UnicornWebApi', {
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      // Disable automated deployments
      deploy: false,
      // Configure as regional endpoint for better latency
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    });

    api.root.addMethod('OPTIONS');

    // Create manual Deployment and Stage
    const deployment = new apigateway.Deployment(
      this,
      `WebApi-${props.stage}-deployment`,
      {
        api: api,
      }
    );
    const apiStage = new apigateway.Stage(this, `WebApi-${props.stage}-stage`, {
      stageName: props.stage,
      deployment,
      // Enable detailed request tracing and metrics
      dataTraceEnabled: true,
      tracingEnabled: true,
      metricsEnabled: true,
      // Configure access logging to CloudWatch
      accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
      methodOptions: {
        '/*/*': {
          loggingLevel:
            props.stage === 'prod'
              ? apigateway.MethodLoggingLevel.ERROR // Only errors in prod
              : apigateway.MethodLoggingLevel.INFO, // Full logging in non-prod
        },
      },
      throttlingBurstLimit: 10,
      throttlingRateLimit: 100,
    });
    api.deploymentStage = apiStage;

    /**
     * CloudFormation output exposing the API endpoint URL
     * Used for client configuration and integration testing
     */
    StackHelper.createOutput(this, {
      name: this.webApiUrlParameter,
      description: 'Web service API endpoint',
      value: api.url,
      stage: props.stage,
      createSsmStringParameter: true,
    });
    StackHelper.createOutput(this, {
      name: this.webRestApiIdParameter,
      description: 'Web service API endpoint',
      value: api.restApiId,
      stage: props.stage,
      createSsmStringParameter: true,
    });
    StackHelper.createOutput(this, {
      name: this.webApiRootResourceIdParameter,
      description: 'Web service API endpoint',
      value: api.restApiRootResourceId,
      stage: props.stage,
      createSsmStringParameter: true,
    });
  }
}
