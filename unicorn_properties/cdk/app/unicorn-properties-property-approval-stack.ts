// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';

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
  StackHelper,
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from '../lib/helper';

/**
 * Properties for the PropertyApprovalStackProps
 * @interface PropertyApprovalStackProps
 *
 * Defines configuration properties required for the property approval workflow stack,
 * including cross-stack references and environment configuration.
 */
interface PropertyApprovalStackProps extends cdk.StackProps {
  /** Deployment stage of the application (local, dev, prod) */
  stage: STAGE;
  /** Name of SSM Parameter containing this service's Event Bus name */
  eventBusNameParameter: string;
  /** Name of SSM Parameter containing the DynamoDB table tracking contract status */
  contractStatusTableNameParameter: string;
  /** Name of SSM Parameter containing the Lambda function handling property approval synchronization */
  propertyApprovalSyncFunctionNameParameter: string;
}

/**
 * Stack that implements the Property services's approval workflow infrastructure
 * @class PropertyApprovalStack
 *
 * This stack demonstrates advanced serverless patterns including:
 * - Step Functions workflow orchestration
 * - Event-driven architecture integration
 * - Asynchronous approval processes
 * - Integration with AI services for content moderation
 * - Error handling and dead letter queues
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new PropertyApprovalStack(app, 'PropertyApprovalStack', {
 *   stage: STAGE.dev,
 *   contractStatusTableName: 'ContractTable',
 *   propertyApprovalSyncFunctionName: 'ApprovalSyncFunction',
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class PropertyApprovalStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new UnicornPropertiesStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - EventBridge event bus through Events Construct
   * - Contracts Construct with associated DynamoDB table
   * - Property Approval Construct integrated with Contracts
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: PropertyApprovalStackProps) {
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

    /**
     * Import resources based on details from SSM Parameter Store
     * Create CDK references to these existing resources.
     */
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'PropertiesEventBus',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.eventBusNameParameter}`
      )
    );

    const table = dynamodb.TableV2.fromTableName(
      this,
      'ContractStatusTable',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.contractStatusTableNameParameter}`
      )
    );

    const taskResponseFunction = lambda.Function.fromFunctionName(
      this,
      'PropertiesApprovalSyncFunction',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.propertyApprovalSyncFunctionNameParameter}`
      )
    );

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
            table: table,
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
    table.grantReadWriteData(waitForContractApprovalFunction);

    /**
     * CloudFormation outputs for Lambda function details
     * Useful for cross-stack references and operational monitoring
     */
    StackHelper.createOutput(this, {
      name: 'WaitForContractApprovalFunctionName',
      value: waitForContractApprovalFunction.functionName,
      stage: props.stage,
    });
    StackHelper.createOutput(this, {
      name: 'WaitForContractApprovalFunctionArn',
      value: waitForContractApprovalFunction.functionArn,
      stage: props.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                              STATE MACHINE                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * Step Functions state machine for property approval workflow
     *
     * Implements a complex approval workflow demonstrating:
     * - Content moderation using AI services (Rekognition, Comprehend)
     * - Human approval task integration
     * - Parallel processing of approval tasks
     * - Error handling and recovery
     * - Event-driven status updates
     *
     * The workflow coordinates:
     * - Image analysis and moderation
     * - Text content review
     * - Contract status verification
     * - Manual approval processes
     * - Status event publication
     */

    // Looks up the existing bucket containing our images's bucket name
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
    const stateMachine = new sfn.StateMachine(this, `ApprovalStateMachine`, {
      stateMachineName: `${cdk.Stack.of(this).stackName}-ApprovalStateMachine`,
      definitionBody: sfn.DefinitionBody.fromFile(
        path.join(
          __dirname,
          '../../src/state_machine/property_approval.asl.yaml'
        )
      ),
      definitionSubstitutions: {
        WaitForContractApprovalArn: waitForContractApprovalFunction.functionArn,
        TableName: table.tableName,
        ImageUploadBucketName: imagesBucketName,
        EventBusName: eventBus.eventBusName,
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
    stateMachine.grantTaskResponse(taskResponseFunction);
    table.grantReadData(stateMachine);
    eventBus.grantPutEventsTo(stateMachine);
    waitForContractApprovalFunction.grantInvoke(stateMachine);

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
      eventBus: eventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.WEB],
        detailType: ['PublicationApprovalRequested'],
      },
      enabled: true,
      targets: [
        new targets.SfnStateMachine(stateMachine, {
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
    StackHelper.createOutput(this, {
      name: 'ApprovalStateMachineLogGroupName',
      value: stateMachineLogGroup.logGroupName,
      stage: props.stage,
    });
    StackHelper.createOutput(this, {
      name: 'ApprovalStateMachineName',
      value: stateMachine.stateMachineName,
      stage: props.stage,
    });
    StackHelper.createOutput(this, {
      name: 'ApprovalStateMachineArn',
      value: stateMachine.stateMachineArn,
      stage: props.stage,
    });
  }
}
