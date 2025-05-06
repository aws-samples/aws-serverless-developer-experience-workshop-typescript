// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import {
  getDefaultLogsRetentionPeriod,
  LambdaHelper,
  StackHelper,
  STAGE,
  UNICORN_NAMESPACES,
} from '../lib/helper';
import PublicationApprovalRequestedEventSchema from '../../integration/PublicationApprovalRequested.json';

/**
 * Properties for the WebPropertyPublicationStack
 * @interface WebPropertyPublicationStackProps
 */
interface WebPropertyPublicationStackProps extends cdk.StackProps {
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
 * @class WebPropertyPublicationStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new WebPropertyPublicationStack(app, 'WebPropertyPublicationStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class WebPropertyPublicationStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new WebPropertyPublicationStack
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
  constructor(
    scope: cdk.App,
    id: string,
    props: WebPropertyPublicationStackProps
  ) {
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
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'WebEventBus',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.eventBusName}`
      )
    );

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
    StackHelper.createOutput(this, {
      name: 'ApprovalRequestQueueUrl',
      description: 'URL for the Ingest SQS Queue',
      value: approvalRequestQueue.queueUrl,
      stage: props.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                                IAM ROLES                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * IAM role for API Gateway to SQS integration
     * Allows API Gateway to send messages to the approval request queue
     */
    const apiIntegrationRole = new iam.Role(
      this,
      `WebApiSqsIntegrationRole-${props.stage}`,
      {
        assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      }
    );
    approvalRequestQueue.grantSendMessages(apiIntegrationRole);

    /* -------------------------------------------------------------------------- */
    /*                               EVENT SCHEMA                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * Define and add the PublicationApprovalRequested event schema to
     * the Web's services EventBridge Schema Registry.
     */
    new eventschemas.CfnSchema(
      this,
      'PublicationApprovalRequestedEventSchema',
      {
        type: 'OpenApi3',
        registryName: `${UNICORN_NAMESPACES.WEB}-${props.stage}`,
        description: 'The schema for a request to publish a property',
        schemaName: `${UNICORN_NAMESPACES.WEB}@PublicationApprovalRequested`,
        content: JSON.stringify(PublicationApprovalRequestedEventSchema),
      }
    );

    /* -------------------------------------------------------------------------- */
    /*                            LAMBDA FUNCTIONS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * Dead Letter Queue for failed publication approval event handling
     */
    const publicationApprovalsEventHandlerDLQ = new sqs.Queue(
      this,
      'publicationApprovedEventHandlerDLQ',
      {
        queueName: `publicationApprovalsEventHandlerDLQ-${props.stage}`,
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
            table: table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.WEB,
          }),
          EVENT_BUS: eventBus.eventBusName,
        },
        logGroup: new logs.LogGroup(this, 'RequestApprovalFunctionLogs', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }),
        deadLetterQueue: publicationApprovalsEventHandlerDLQ,
      }
    );
    // Grant permissions to the approval request function
    eventBus.grantPutEventsTo(approvalRequestFunction);
    table.grantReadData(approvalRequestFunction);

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
            table: table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.WEB,
          }),
        },
        logGroup: new logs.LogGroup(this, 'PublicationApprovedLogs', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }),
        deadLetterQueue: publicationApprovalsEventHandlerDLQ,
      }
    );
    table.grantWriteData(publicationApprovedFunction);

    // CloudFormation Stack Outputs for publicationApprovedFunction
    StackHelper.createOutput(this, {
      name: 'PublicationApprovedEventHandlerFunctionName',
      value: publicationApprovedFunction.functionName,
      stage: props.stage,
    });

    StackHelper.createOutput(this, {
      name: 'PublicationApprovedEventHandlerFunctionArn',
      value: publicationApprovedFunction.functionArn,
      stage: props.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                                 EVENT RULES                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * EventBridge rule for publication evaluation events
     * Routes PublicationEvaluationCompleted events to the handler function
     */
    new events.Rule(this, 'unicorn.web-PublicationEvaluationCompleted', {
      ruleName: 'unicorn.web-PublicationEvaluationCompleted',
      description: `PublicationEvaluationCompleted events published by the ${UNICORN_NAMESPACES.PROPERTIES} service.`,
      eventBus: eventBus,
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
        credentialsRole: apiIntegrationRole,
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
    api.root.addResource('request_approval').addMethod('POST', sqsIntegration, {
      methodResponses: [{ statusCode: '200' }],
    });
    // CloudFormation stack output for /request_approval path
    StackHelper.createOutput(this, {
      name: 'ApiPropertyApproval',
      description: 'POST request to add a property to the database',
      value: `${apiUrl}request_approval`,
      stage: props.stage,
    });

    const deployment = new apigateway.Deployment(this, 'deployment', {
      api: api,
      stageName: props.stage,
    });
    deployment.node.addDependency(api.root);
  }
}
