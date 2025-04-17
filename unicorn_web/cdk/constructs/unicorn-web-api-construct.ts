// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

import { getDefaultLogsRetentionPeriod, STAGE } from './helper';

/**
 * Properties for the ApiConstruct construct
 * @interface ApiConstructProps
 */
interface ApiConstructProps {
  stage: STAGE;
}

/**
 * Construct that defines the API Gateway infrastructure for the Unicorn Web application
 * @class ApiConstruct
 *
 * @example
 * ```typescript
 * const apiConstruct = new ApiConstruct(stack, 'ApiConstruct', {
 *   stage: STAGE.dev
 * });
 * ```
 */
export class ApiConstruct extends Construct {
  /** REST API Gateway instance */
  public readonly api: apigateway.RestApi;

  /**
   * Creates a new ApiConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - REST API Gateway
   * - CloudWatch log group for API logging
   * - Associated IAM roles for CloudWatch integration
   */
  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    /**
     * CloudWatch log group for API Gateway access logs
     * Configured with stage-appropriate retention period and removal policy
     */
    const apiLogGroup = new logs.LogGroup(this, 'UnicornWebApiLogGroup', {
      retention: getDefaultLogsRetentionPeriod(props.stage),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /* -------------------------------------------------------------------------- */
    /*                              API GATEWAY                                     */
    /* -------------------------------------------------------------------------- */

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
    this.api = new apigateway.RestApi(this, 'UnicornWebApi', {
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      // Deployment configuration
      deployOptions: {
        stageName: props.stage,
        // Enable detailed request tracing and metrics
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
        // Configure access logging to CloudWatch
        accessLogDestination: new apigateway.LogGroupLogDestination(
          apiLogGroup
        ),
        methodOptions: {
          '/*/*': {
            loggingLevel:
              props.stage === 'prod'
                ? apigateway.MethodLoggingLevel.ERROR // Only errors in prod
                : apigateway.MethodLoggingLevel.INFO, // Full logging in non-prod
          },
        },
      },
      // Configure as regional endpoint for better latency
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    });
    /**
     * CloudFormation output exposing the API endpoint URL
     * Used for client configuration and integration testing
     */
    new cdk.CfnOutput(this, 'ApiUrl', {
      exportName: 'ApiUrl',
      description: 'Web service API endpoint',
      value: this.api.url,
    });
  }
}
