// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  DynamoEventSource,
  SqsDlq,
} from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import {
  LambdaHelper,
  StackHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from '../constructs/helper';

/**
 * Properties for the PropertyContractsStackProps
 * @interface PropertyContractsStackProps
 */
interface PropertyContractsStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Stack that defines the Properties service's Contract Management infrastructure
 * @class PropertyContractsStack
 *
 * This stack manages the integration between the Properties service and Contracts service,
 * handling contract status changes and property approval synchronization.
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new PropertyContractsStack(app, 'PropertyContractsStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class PropertyContractsStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;
  /** Name of the DynamoDB table tracking contract status */
  public contractStatusTableName: string;
  /** Name of the Lambda function handling property approval synchronization */
  public propertyApprovalSyncFunctionName: string;

  /**
   * Creates a new PropertyContractsStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - DynamoDB table for contract status tracking with stream enabled
   * - Dead Letter Queues for error handling
   * - Lambda function to handle ContractStatusChange events from EventBridge
   * - Lambda function to sync property approvals based on DynamoDB stream events
   * - EventBridge rule for routing ContractStatusChanged events
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: PropertyContractsStackProps) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.PROPERTIES,
      stage: this.stage,
    });

    this.contractStatusTableName = 'ContractStatusTableName';
    this.propertyApprovalSyncFunctionName =
      'PropertiesApprovalSyncFunctionName';
    /**
     * Retrieve the Properties service EventBus name from SSM Parameter Store
     * and create a reference to the existing EventBus
     */
    const eventBusName = ssm.StringParameter.fromStringParameterName(
      this,
      'PropertiesEventBusName',
      `/uni-prop/${props.stage}/UnicornPropertiesEventBus`
    );
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'PropertiesEventBus',
      eventBusName.stringValue
    );

    /* -------------------------------------------------------------------------- */
    /*                                  STORAGE                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * DynamoDB table for storing contract status data
     * Uses property_id as partition key for efficient querying
     * Includes stream configuration to trigger the PropertiesApprovalSync function
     */
    const table = new dynamodb.TableV2(this, `ContractStatusTable`, {
      tableName: `uni-prop-${props.stage}-properties-ContractStatusTable`,
      partitionKey: {
        name: 'property_id',
        type: dynamodb.AttributeType.STRING,
      },
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // be careful with this in production
    });

    /**
     * CloudFormation output for Contracts table name
     */
    StackHelper.createOutput(this, {
      name: 'ContractStatusTableName',
      description: 'DynamoDB table storing contract status information',
      value: table.tableName,
      export: true,
    });

    /* -------------------------------------------------------------------------- */
    /*                            LAMBDA FUNCTIONS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * Dead Letter Queue for the Properties service
     * Handles failed event processing
     */
    const propertiesServiceDlq = new sqs.Queue(this, 'PropertiesServiceDlq', {
      queueName: `PropertiesServiceDlq-${props.stage}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * DLQ for failed EventBridge event delivery to ContractEventHandlerFunction
     */
    const contractStatusChangedEventsDlq = new sqs.Queue(
      this,
      'ContractStatusChangedEventsDlq',
      {
        queueName: `ContractStatusChangedEventsDlq-${props.stage}`,
        retentionPeriod: cdk.Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    /**
     * Lambda function to handle ContractStatusChange events
     */
    const contractStatusChangedFunction = new nodejs.NodejsFunction(
      this,
      `ContractEventHandlerFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/properties_service/contractStatusChangedEventHandler.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.PROPERTIES,
          }),
        },
        deadLetterQueue: propertiesServiceDlq,
        logGroup: new logs.LogGroup(
          this,
          'ContractStatusChangedHandlerFunctionLogGroup',
          {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: getDefaultLogsRetentionPeriod(props.stage),
          }
        ),
      }
    );
    /**
     * EventBridge rule for ContractStatusChange events
     */
    new events.Rule(this, 'unicorn.properties-ContractStatusChanged', {
      ruleName: 'unicorn.properties-ContractStatusChanged',
      description:
        'ContractStatusChanged events published by the Contracts service.',
      eventBus: eventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.CONTRACTS],
        detailType: ['ContractStatusChanged'],
      },
      enabled: true,
      targets: [
        new targets.LambdaFunction(contractStatusChangedFunction, {
          deadLetterQueue: contractStatusChangedEventsDlq,
          retryAttempts: 5,
          maxEventAge: cdk.Duration.minutes(15),
        }),
      ],
    });
    // Grant permissions for contract status changed function
    table.grantReadWriteData(contractStatusChangedFunction);

    // CloudFormation outputs for contract status changed function
    StackHelper.createOutput(this, {
      name: 'ContractStatusChangedHandlerFunctionArn',
      value: contractStatusChangedFunction.functionArn,
    });
    StackHelper.createOutput(this, {
      name: 'ContractStatusChangedHandlerFunctionName',
      value: contractStatusChangedFunction.functionName,
    });

    /**
     * Lambda function that processes DynamoDB stream events from ContractStatusTable
     * to synchronize property approval states. This function:
     * - Listens to changes in contract status
     * - Processes the changes to update property approval workflows
     * - Handles failures using a Dead Letter Queue
     */
    const propertiesApprovalSyncFunction = new nodejs.NodejsFunction(
      this,
      `PropertiesApprovalSyncFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/properties_service/propertiesApprovalSyncFunction.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.PROPERTIES,
          }),
        },
        deadLetterQueue: propertiesServiceDlq,
        /**
         * CloudWatch log group for the PropertiesApprovalSync function
         * Configured with stage-appropriate retention period
         */
        logGroup: new logs.LogGroup(
          this,
          'PropertiesApprovalSyncFunctionLogGroup',
          {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: getDefaultLogsRetentionPeriod(props.stage),
          }
        ),
      }
    );
    // Add DynamoDB Stream as an event source for the Properties Approval Sync Function
    propertiesApprovalSyncFunction.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        onFailure: new SqsDlq(propertiesServiceDlq),
      })
    );
    // Allow Properties Approval Sync function to send messages to the Properties Service Dead Letter Queue
    propertiesServiceDlq.grantSendMessages(propertiesApprovalSyncFunction);
    // Allow Properties Approval Sync function to read data and stream data from Contract Status DynamoDB table
    table.grantReadData(propertiesApprovalSyncFunction);
    table.grantStreamRead(propertiesApprovalSyncFunction);

    // CloudFormation output for properties approval sync function
    StackHelper.createOutput(this, {
      name: this.propertyApprovalSyncFunctionName,
      value: propertiesApprovalSyncFunction.functionName,
      export: true,
    });
  }
}
