// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import {
  LambdaHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from './helper';

/**
 * Properties for the PropertyApprovalConstruct construct
 * @interface PropertyApprovalConstructProps
 */
interface PropertyApprovalConstructProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** EventBridge event bus for publishing events */
  eventBus: events.EventBus;
  /** DynamoDB table for property data storage */
  table: dynamodb.TableV2;
  /** Lambda function for resuming the StepFunction workflow */
  taskResponseFunction: lambda.Function;
}

/**
 * Construct that defines the Property Approval infrastructure
 * Manages property approval workflow and state machine
 * @class PropertyApprovalConstruct
 *
 * @example
 * ```typescript
 * const approvalDomain = new PropertyApprovalConstruct(stack, 'PropertyApprovalConstruct', {
 *   stage: STAGE.dev,
 *   eventBus: myEventBus,
 *   table: myDynamoTable,
 *   taskResponseFunction: myTaskResponseFunction
 * });
 * ```
 */
export class PropertyApprovalConstruct extends Construct {
  /** Step Functions state machine for property approval workflow */
  public readonly stateMachine: sfn.StateMachine;

  /**
   * Creates a new PropertyApprovalConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - Lambda function for contract approval workflow
   * - Step Functions state machine for approval process
   * - Dead Letter Queues for error handling
   * - EventBridge rules for approval events
   * - Associated CloudWatch log groups
   */
  constructor(
    scope: Construct,
    id: string,
    props: PropertyApprovalConstructProps
  ) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                              LAMBDA FUNCTION                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * Lambda function to handle contract approval workflow
     * Updates the Property Item in DynamoDB Table with the
     * Step Function Task Token used to resume workflow.
     */
    const waitForContractApprovalFunction = new nodejs.NodejsFunction(
      this,
      `WaitForContractApprovalFunction-${props.stage}`,
      {
        ...LambdaHelper.defaultLambdaOptions,
        entry: path.join(
          __dirname,
          '../../src/properties_service/waitForContractApprovalFunction.ts'
        ),
        environment: {
          ...LambdaHelper.getDefaultEnvironmentVariables({
            table: props.table,
            stage: props.stage,
            serviceNamespace: UNICORN_NAMESPACES.PROPERTIES,
          }),
        },
        logGroup: new logs.LogGroup(
          this,
          'WaitForContractApprovalFunctionLogGroup',
          {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            retention: getDefaultLogsRetentionPeriod(props.stage),
          }
        ),
      }
    );
    // Grant read and write access to DynamoDB table
    props.table.grantReadWriteData(waitForContractApprovalFunction);

    /**
     * CloudFormation outputs for Lambda function details
     * Useful for cross-stack references and operational monitoring
     */
    new cdk.CfnOutput(this, 'WaitForContractApprovalFunctionName', {
      key: 'WaitForContractApprovalFunctionName',
      value: waitForContractApprovalFunction.functionName,
    });
    new cdk.CfnOutput(this, 'WaitForContractApprovalFunctionArn', {
      key: 'WaitForContractApprovalFunctionArn',
      value: waitForContractApprovalFunction.functionArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                              STATE MACHINE                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * Retrieve images bucket name from SSM parameter store
     * Used for property image processing in approval workflow
     */
    const imagesBucketName = ssm.StringParameter.valueForTypedStringParameterV2(
      this,
      `/uni-prop/${props.stage}/ImagesBucket`,
      ssm.ParameterValueType.STRING
    );

    /**
     * CloudWatch log group for Step Functions state machine
     * Captures execution logs for debugging and monitoring
     */
    const stateMachineLogGroup = new logs.LogGroup(
      this,
      'ApprovalStateMachineLogGroup',
      {
        logGroupName: `/aws/vendedlogs/states/uni-prop-${props.stage}-${UNICORN_NAMESPACES.PROPERTIES}-ApprovalStateMachine`,
        retention: getDefaultLogsRetentionPeriod(props.stage),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    /**
     * Step Functions state machine for property approval workflow
     * Orchestrates the end-to-end approval process
     */
    this.stateMachine = new sfn.StateMachine(this, `ApprovalStateMachine`, {
      stateMachineName: `${cdk.Stack.of(this).stackName}-ApprovalStateMachine`,
      definitionBody: sfn.DefinitionBody.fromFile(
        path.join(
          __dirname,
          '../../src/state_machine/property_approval.asl.yaml'
        )
      ),
      definitionSubstitutions: {
        WaitForContractApproval: waitForContractApprovalFunction.functionArn,
        TableName: props.table.tableName,
        ImageUploadBucketName: imagesBucketName,
        EventBusName: props.eventBus.eventBusName,
        ServiceName: UNICORN_NAMESPACES.PROPERTIES,
      },
      tracingEnabled: true,
      logs: {
        level: sfn.LogLevel.ALL,
        includeExecutionData: true,
        destination: stateMachineLogGroup,
      },
      role: new iam.Role(this, 'StateMachineRole', {
        assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AWSXRayDaemonWriteAccess'
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName('ComprehendFullAccess'),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonRekognitionFullAccess'
          ),
        ],
        inlinePolicies: {
          CloudWatchPublishLogsMetrics: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: [
                  'logs:CreateLogDelivery',
                  'logs:GetLogDelivery',
                  'logs:UpdateLogDelivery',
                  'logs:DeleteLogDelivery',
                  'logs:ListLogDeliveries',
                  'logs:PutResourcePolicy',
                  'logs:DescribeResourcePolicies',
                  'logs:DescribeLogGroups',
                  'cloudwatch:PutMetricData',
                ],
                resources: ['*'],
              }),
            ],
          }),
          S3ReadPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ['s3:Get*'],
                resources: [`arn:aws:s3:::${imagesBucketName}/*`],
              }),
            ],
          }),
        },
      }),
    });
    // Grant necessary permissions for state machine
    this.stateMachine.grantTaskResponse(props.taskResponseFunction);
    props.table.grantReadData(this.stateMachine);
    props.eventBus.grantPutEventsTo(this.stateMachine);
    waitForContractApprovalFunction.grantInvoke(this.stateMachine);

    /* -------------------------------------------------------------------------- */
    /*                              EVENT HANDLING                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * Dead Letter Queue for failed EventBridge to Step Functions workflow events
     * Captures events that fail to be delivered to the state machine
     */
    const workflowEventsDlq = new sqs.Queue(this, 'WorkflowEventsDlq', {
      queueName: `WorkflowEventsDlq-${props.stage}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * EventBridge rule for publication approval requests
     * Triggers the approval workflow state machine
     */
    new events.Rule(this, 'unicorn.properties-PublicationApprovalRequested', {
      ruleName: 'unicorn.properties-PublicationApprovalRequested',
      description:
        'PublicationApprovalRequested events published by the Web service.',
      eventBus: props.eventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.WEB],
        detailType: ['PublicationApprovalRequested'],
      },
      enabled: true,
      targets: [
        new targets.SfnStateMachine(this.stateMachine, {
          deadLetterQueue: workflowEventsDlq,
          retryAttempts: 5,
          maxEventAge: cdk.Duration.minutes(15),
        }),
      ],
    });

    /**
     * CloudFormation outputs for state machine resources
     * Enables operational monitoring and cross-stack references
     */
    new cdk.CfnOutput(this, 'ApprovalStateMachineLogGroupName', {
      key: 'ApprovalStateMachineLogGroupName',
      value: stateMachineLogGroup.logGroupName,
    });
    new cdk.CfnOutput(this, 'ApprovalStateMachineName', {
      key: 'ApprovalStateMachineName',
      value: this.stateMachine.stateMachineName,
    });
    new cdk.CfnOutput(this, 'ApprovalStateMachineArn', {
      key: 'ApprovalStateMachineArn',
      value: this.stateMachine.stateMachineArn,
    });
  }
}
