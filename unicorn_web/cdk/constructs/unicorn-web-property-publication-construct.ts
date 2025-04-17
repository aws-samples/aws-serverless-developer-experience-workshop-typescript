// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import {
  LambdaHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from './helper';

/**
 * Properties for the PropertyPublicationConstruct construct
 * @interface PropertyPublicationConstructProps
 */
interface PropertyPublicationConstructProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** DynamoDB table for storing property data */
  table: dynamodb.TableV2;
  /** REST API Gateway instance */
  api: apigateway.RestApi;
  /** EventBridge event bus for publishing events */
  eventBus: events.EventBus;
}

/**
 * Construct that manages the property publication Construct including approval requests and publication workflows
 * @class PropertyPublicationConstruct
 *
 * @example
 * ```typescript
 * const Construct = new PropertyPublicationConstruct(this, 'PublicationConstruct', {
 *   stage: STAGE.dev,
 *   table: myTable,
 *   api: myApi,
 *   eventBus: myEventBus
 * });
 * ```
 */
export class PropertyPublicationConstruct extends Construct {
  /**
   * Creates a new PropertyPublicationConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - Dead letter queues for handling failed messages
   * - SQS queue for approval requests
   * - IAM roles for API Gateway integration
   * - Lambda functions for request processing and publication handling
   * - EventBridge rules for publication evaluation
   * - API Gateway integration with SQS
   */
  constructor(
    scope: Construct,
    id: string,
    props: PropertyPublicationConstructProps
  ) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                                SQS QUEUES                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Dead Letter Queue for failed ingestion messages
     * Store
     */
    const ingestQueueDLQ = new sqs.Queue(this, 'IngestDLQ', {
      queueName: `IngestDLQ-${props.stage}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * Main approval request queue
     * Handles incoming property approval requests
     * Configured with DLQ for failed message handling
     */
    const approvalRequestQueue = new sqs.Queue(
      this,
      `ApprovalRequestQueue-${props.stage}`,
      {
        queueName: `ApprovalRequestQueue-${props.stage}`,
        deadLetterQueue: {
          queue: ingestQueueDLQ,
          maxReceiveCount: 1,
        },
        visibilityTimeout: cdk.Duration.seconds(20),
        retentionPeriod: cdk.Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        enforceSSL: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
    /**
     * CloudFormation output for ApprovalRequestQueue URL
     */
    new cdk.CfnOutput(this, 'ApprovalRequestQueueUrl', {
      exportName: 'ApprovalRequestQueueUrl',
      description: 'URL for the Ingest SQS Queue',
      value: approvalRequestQueue.queueUrl,
    });

    /* -------------------------------------------------------------------------- */
    /*                                IAM ROLES                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * IAM role for API Gateway to SQS integration
     * Allows API Gateway to send messages to the approval request queue
     */
    const apiRole = new iam.Role(this, 'UnicornWebApiIntegrationRole', {
      roleName: `UnicornWebApiIntegrationRole-${props.stage}`,
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    approvalRequestQueue.grantSendMessages(apiRole);

    /* -------------------------------------------------------------------------- */
    /*                            LAMBDA FUNCTIONS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * Dead Letter Queue for failed publication approval event handling
     */
    const publicationApprovedEventHandlerDLQ = new sqs.Queue(
      this,
      'publicationApprovedEventHandlerDLQ',
      {
        queueName: `publicationApprovadEventHandlerDLQ-${props.stage}`,
        retentionPeriod: cdk.Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        enforceSSL: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    /**
     * Lambda function to process queued API requests for property approval
     * Processes messages from the ApprovalRequestQueue and publishes events to EventBridge
     */
    const approvalRequestFunction = new nodejs.NodejsFunction(
      this,
      `RequestApprovalFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/approvals_service/requestApprovalFunction.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: props.table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.WEB,
          }),
          EVENT_BUS: props.eventBus.eventBusName,
        },
        logGroup: new logs.LogGroup(this, 'RequestApprovalFunctionLogs', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }),
        deadLetterQueue: publicationApprovedEventHandlerDLQ,
      }
    );
    // Grant permissions to the approval request function
    props.eventBus.grantPutEventsTo(approvalRequestFunction);
    props.table.grantReadData(approvalRequestFunction);

    /**
     * Configure SQS event source for the approval request function
     * Processes messages in batches of 1 with maximum concurrency of 5
     */
    approvalRequestFunction.addEventSource(
      new SqsEventSource(approvalRequestQueue, {
        batchSize: 1,
        maxConcurrency: 5,
      })
    );

    /**
     * Lambda function to handle approved publication events
     * Processes PublicationEvaluationCompleted events and updates DynamoDB
     */
    const publicationApprovedFunction = new nodejs.NodejsFunction(
      this,
      `PublicationApprovedFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/approvals_service/publicationApprovedEventHandler.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: props.table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.WEB,
          }),
        },
        logGroup: new logs.LogGroup(this, 'PublicationApprovedLogs', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }),
        deadLetterQueue: publicationApprovedEventHandlerDLQ,
      }
    );
    props.table.grantWriteData(publicationApprovedFunction);

    // CloudFormation Stack Outputs for publicationApprovedFunction
    new cdk.CfnOutput(this, 'PublicationApprovedEventHandlerFunctionName', {
      exportName: 'PublicationApprovedEventHandlerFunctionName',
      value: publicationApprovedFunction.functionName,
    });
    new cdk.CfnOutput(this, 'PublicationApprovedEventHandlerFunctionArn', {
      exportName: 'PublicationApprovedEventHandlerFunctionArn',
      value: publicationApprovedFunction.functionArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                           EVENT RULES                                        */
    /* -------------------------------------------------------------------------- */

    /**
     * EventBridge rule for publication evaluation events
     * Routes PublicationEvaluationCompleted events to the handler function
     */
    new events.Rule(this, 'unicorn.web-PublicationEvaluationCompleted', {
      ruleName: 'unicorn.web-PublicationEvaluationCompleted',
      description:
        'PublicationEvaluationCompleted events published by the Properties service.',
      eventBus: props.eventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.PROPERTIES],
        detailType: ['PublicationEvaluationCompleted'],
      },
    }).addTarget(new targets.LambdaFunction(publicationApprovedFunction));

    /* -------------------------------------------------------------------------- */
    /*                           API GATEWAY INTEGRATION                            */
    /* -------------------------------------------------------------------------- */

    /**
     * API Gateway integration with SQS
     * Configures the REST API to send messages to the approval request queue
     */
    const sqsIntegration = new apigateway.AwsIntegration({
      service: 'sqs',
      // region: this.region,
      integrationHttpMethod: 'POST',
      path: approvalRequestQueue.queueName,
      options: {
        credentialsRole: apiRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"message":"OK"}',
            },
          },
        ],
        requestParameters: {
          'integration.request.header.Content-Type':
            "'application/x-www-form-urlencoded'",
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json':
            'Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String',
        },
      },
    });

    /**
     * API Gateway method for requesting approval
     * Path: POST /request_approval
     * Integrates with SQS for asynchronous processing
     */
    props.api.root
      .addResource('request_approval')
      .addMethod('POST', sqsIntegration, {
        methodResponses: [{ statusCode: '200' }],
      });
    // CloudFormation stack output for /request_approval path
    new cdk.CfnOutput(this, 'ApiPropertyApproval', {
      exportName: 'ApiPropertyApproval',
      description: 'POST request to add a property to the database',
      value: `${props.api.url}request_approval`,
    });
  }
}
