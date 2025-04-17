// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import { Construct } from 'constructs';
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

import {
  LambdaHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from './helper';

/**
 * Properties for the ContractsConstruct construct
 * @interface ContractsConstructProps
 */
interface ContractsConstructProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** EventBridge event bus for publishing events */
  eventBus: events.EventBus;
}

/**
 * Construct that manages the contracts domain including contract creation and status updates
 * Handles integration between Properties service and contract lifecycle events
 * @class ContractsConstruct
 *
 * @example
 * ```typescript
 * const domain = new ContractsConstruct(this, 'ContractsConstruct', {
 *   stage: STAGE.dev,
 *   eventBus: myEventBus
 * });
 * ```
 */
export class ContractsConstruct extends Construct {
  /** DynamoDB table for storing contract data */
  public readonly table: dynamodb.TableV2;
  /** Lambda function for property approval synchronization */
  public readonly propertiesApprovalSyncFunction: nodejs.NodejsFunction;

  /**
   * Creates a new ContractsConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - DynamoDB table for contract status tracking
   * - Lambda functions for contract event processing
   * - Dead Letter Queues for error handling
   * - EventBridge rules for contract status events
   * - Associated CloudWatch log groups
   */
  constructor(scope: Construct, id: string, props: ContractsConstructProps) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                                  STORAGE                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * DynamoDB table for storing contract status data
     * Uses property_id as partition key for efficient querying
     */
    this.table = new dynamodb.TableV2(this, `ContractStatusTable`, {
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
    new cdk.CfnOutput(this, 'ContractStatusTableName', {
      key: 'ContractStatusTableName',
      description: 'DynamoDB table storing contract status information',
      value: this.table.tableName,
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
            table: this.table,
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
      eventBus: props.eventBus,
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
    this.table.grantReadWriteData(contractStatusChangedFunction);

    // CloudFormation outputs for contract status changed function
    new cdk.CfnOutput(this, 'ContractStatusChangedHandlerFunctionArn', {
      key: 'ContractStatusChangedHandlerFunctionArn',
      value: contractStatusChangedFunction.functionArn,
    });
    new cdk.CfnOutput(this, 'ContractStatusChangedHandlerFunctionName', {
      key: 'ContractStatusChangedHandlerFunctionName',
      value: contractStatusChangedFunction.functionName,
    });

    /**
     * Lambda function which listens to Contract status changes from
     * ContractStatusTable to un-pause StepFunctions.
     */
    this.propertiesApprovalSyncFunction = new nodejs.NodejsFunction(
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
            table: this.table,
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
    this.propertiesApprovalSyncFunction.addEventSource(
      new DynamoEventSource(this.table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        onFailure: new SqsDlq(propertiesServiceDlq),
      })
    );
    // Allow Properties Approval Sync function to send messages to the Properties Service Dead Letter Queue
    propertiesServiceDlq.grantSendMessages(this.propertiesApprovalSyncFunction);
    // Allow Properties Approval Sync function to read data and stream data from Contract Status DynamoDB table
    this.table.grantReadData(this.propertiesApprovalSyncFunction);
    this.table.grantStreamRead(this.propertiesApprovalSyncFunction);

    // CloudFormation output for properties approval sync function
    new cdk.CfnOutput(this, 'PropertiesApprovalSyncFunctionName', {
      key: 'PropertiesApprovalSyncFunctionName',
      value: this.propertiesApprovalSyncFunction.functionName,
    });
  }
}
