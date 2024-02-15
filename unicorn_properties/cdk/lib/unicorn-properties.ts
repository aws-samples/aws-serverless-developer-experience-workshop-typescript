import * as path from "path";
import {
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
  App,
  CfnOutput,
} from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as logs from "aws-cdk-lib/aws-logs";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import {
  DynamoEventSource,
  SqsDlq,
} from "aws-cdk-lib/aws-lambda-event-sources";
import {
  LogsRetentionPeriod,
  Stage,
  isProd,
  UNICORN_PROPERTIES_NAMESPACE,
  UNICORN_WEB_NAMESPACE,
  UNICORN_CONTRACTS_NAMESPACE,
} from "unicorn_shared";
import { SubscriberPoliciesStack } from "./subscriber-policies";
import { EventsSchemaStack } from "./event-schemas";
import {
  DefinitionBody,
  LogLevel,
  StateMachine,
} from "aws-cdk-lib/aws-stepfunctions";

interface UnicornPropertiesStackProps extends StackProps {
  stage: Stage;
}

export class UnicornConstractsStack extends Stack {
  constructor(scope: App, id: string, props: UnicornPropertiesStackProps) {
    super(scope, id, props);

    const retentionPeriod = LogsRetentionPeriod(props.stage);

    /*
      EVENT BUS
    */
    const eventBus = new events.EventBus(
      this,
      `UnicornProperties-${props.stage}`,
      {
        eventBusName: `UnicornProperties-${props.stage}`,
      }
    );

    // CloudWatch log group used to catch all events
    const catchAllLogGroup = new logs.LogGroup(
      this,
      "UnicornPropertiesCatchAllLogGroup",
      {
        logGroupName: `/aws/events/${props.stage}/${UNICORN_PROPERTIES_NAMESPACE}-catchall`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: retentionPeriod,
      }
    );

    // Event bus policy to restrict who can publish events (should only be services from UnicornPropertiesNamespace)
    new events.EventBusPolicy(this, "UnicornPropertiesEventsBusPublishPolicy", {
      eventBus: eventBus,
      statementId: `OnlyPropertiesServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ["events:PutEvents"],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEquals: { "events:Source": UNICORN_PROPERTIES_NAMESPACE },
        },
      }).toJSON(),
    });

    // Catchall rule used for development purposes.
    new events.Rule(this, "UnicornPropertiesCatchAllRule", {
      description: "Catchall rule used for development purposes.",
      eventBus: eventBus,
      eventPattern: {
        source: [
          UNICORN_PROPERTIES_NAMESPACE,
          UNICORN_WEB_NAMESPACE,
          UNICORN_CONTRACTS_NAMESPACE,
        ],
        account: [this.account],
      },
      enabled: true,
      targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
    });

    /*
     DYNAMODB TABLE
     */
    const table = new dynamodb.TableV2(this, `ContractStatusTable`, {
      tableName: `uni-prop-${props.stage}-contracts-ContractStatusTable`,

      partitionKey: {
        name: "property_id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });
    /*
      DEAD LETTER QUEUES
    */
    // Store EventBridge events that failed to be DELIVERED to ContractStatusChangedHandlerFunction
    const eventBusDLQ = new sqs.Queue(this, "PropertiesEventBusRuleDLQ", {
      removalPolicy: RemovalPolicy.DESTROY,
      retentionPeriod: Duration.days(14),
      queueName: `PropertiesEventBusRuleDLQ-${props.stage}`,
    });

    // Store failed INVOCATIONS to each Lambda function in Unicorn Properties Service
    const propertiesServiceDLQ = new sqs.Queue(this, "PropertiesServiceDLQ", {
      removalPolicy: RemovalPolicy.DESTROY,
      retentionPeriod: Duration.days(14),
      queueName: `PropertiesServiceDLQ-${props.stage}`,
    });

    /*
      LAMBDA FUNCTIONS
    */
    const defaultLambdaOptions: nodejs.NodejsFunctionProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambdaHandler",
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 128,
      timeout: Duration.seconds(15),
      architecture: lambda.Architecture.X86_64,
      environment: {
        CONTRACT_STATUS_TABLE: table.tableName,
        EVENT_BUS: eventBus.eventBusName,
        SERVICE_NAMESPACE: UNICORN_PROPERTIES_NAMESPACE,
        POWERTOOLS_LOGGER_CASE: "PascalCase",
        POWERTOOLS_SERVICE_NAME: UNICORN_PROPERTIES_NAMESPACE,
        POWERTOOLS_TRACE_DISABLED: "false", // Explicitly disables tracing, default
        POWERTOOLS_LOGGER_LOG_EVENT: isProd(props.stage) ? "false" : "true", // Logs incoming event, default
        POWERTOOLS_LOGGER_SAMPLE_RATE: isProd(props.stage) ? "0.1" : "0", // Debug log sampling percentage, default
        POWERTOOLS_METRICS_NAMESPACE: UNICORN_PROPERTIES_NAMESPACE,
        POWERTOOLS_LOG_LEVEL: "INFO", // Log level for Logger (INFO, DEBUG, etc.), default
        LOG_LEVEL: "INFO", // Log level for Logger
      },
      deadLetterQueue: propertiesServiceDLQ,
    };

    /* Listens to ContractStatusChanged events from EventBridge */
    const contractStatusChangedHandlerFunction = new nodejs.NodejsFunction(
      this,
      `ContractEventHandlerFunction-${props.stage}`,
      {
        ...defaultLambdaOptions,
        entry: path.join(
          __dirname,
          "../../src/properties_service/contractStatusChanged.ts"
        ),
        logGroup: new logs.LogGroup(
          this,
          "ContractStatusChangedHandlerFunctionLogGroup",
          {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: retentionPeriod,
          }
        ),
      }
    );
    table.grantReadWriteData(contractStatusChangedHandlerFunction);
    propertiesServiceDLQ.grantSendMessages(
      contractStatusChangedHandlerFunction
    );
    new events.Rule(this, "unicorn.properties-ContractStatusChanged", {
      ruleName: "unicorn.properties-ContractStatusChanged",
      eventBus: eventBus,
      eventPattern: {
        source: [UNICORN_CONTRACTS_NAMESPACE],
        detailType: ["ContractStatusChanged"],
      },
    }).addTarget(
      new targets.LambdaFunction(contractStatusChangedHandlerFunction, {
        deadLetterQueue: eventBusDLQ,
      })
    );

    // Listens to Contract status changes from ContractStatusTable to un-pause StepFunctions
    const propertiesApprovalSyncFunction = new nodejs.NodejsFunction(
      this,
      `PropertiesApprovalSyncFunction`,
      {
        ...defaultLambdaOptions,
        entry: path.join(
          __dirname,
          "../../src/properties_service/propertiesApprovalSyncFunction.ts"
        ),
        logGroup: new logs.LogGroup(
          this,
          "PropertiesApprovalSyncFunctionLogGroup",
          {
            retention: retentionPeriod,
          }
        ),
      }
    );
    propertiesServiceDLQ.grantSendMessages(propertiesApprovalSyncFunction);
    table.grantStreamRead(propertiesApprovalSyncFunction);
    table.grantReadData(propertiesApprovalSyncFunction);
    propertiesApprovalSyncFunction.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        onFailure: new SqsDlq(propertiesServiceDLQ),
      })
    );

    // Part of the ApprovalStateMachine, checks if a given Property has an existing Contract in ContractStatusTable
    const contractExistsCheckerFunction = new nodejs.NodejsFunction(
      this,
      `ContractExistsCheckerFunction`,
      {
        ...defaultLambdaOptions,
        entry: path.join(
          __dirname,
          "../../src/properties_service/contractExistsCheckerFunction.ts"
        ),
        logGroup: new logs.LogGroup(
          this,
          "ContractExistsCheckerFunctionLogGroup",
          {
            retention: retentionPeriod,
          }
        ),
      }
    );
    table.grantReadWriteData(contractExistsCheckerFunction);

    const waitForContractApprovalFunction = new nodejs.NodejsFunction(
      this,
      `waitForContractApprovalFunction`,
      {
        ...defaultLambdaOptions,
        entry: path.join(
          __dirname,
          "../../src/properties_service/waitForContractApprovalFunction.ts"
        ),
        logGroup: new logs.LogGroup(
          this,
          "waitForContractApprovalFunctionLogGroup",
          {
            retention: retentionPeriod,
          }
        ),
      }
    );
    table.grantReadWriteData(waitForContractApprovalFunction);

    // Part of the ApprovalStateMachine, validates if all outputs of content checking steps are OK
    const contentIntegrityValidatorFunction = new nodejs.NodejsFunction(
      this,
      `contentIntegrityValidatorFunction`,
      {
        ...defaultLambdaOptions,
        entry: path.join(
          __dirname,
          "../../src/properties_service/contentIntegrityValidatorFunction.ts"
        ),
        logGroup: new logs.LogGroup(
          this,
          "contentIntegrityValidatorFunctionLogGroup",
          {
            retention: retentionPeriod,
          }
        ),
      }
    );
    /*
      STATE MACHINE
    */
    const imagesBucketName = ssm.StringParameter.valueForTypedStringParameterV2(
      this,
      `/uni-prop/${props.stage}/ImagesBucket`,
      ssm.ParameterValueType.STRING
    );
    const stateMachineLogGroup = new logs.LogGroup(
      this,
      "ApprovalStateMachineLogGroup",
      {
        retention: retentionPeriod,
      }
    );

    const stateMachine = new StateMachine(this, `ApprovalStateMachine`, {
      stateMachineName: `${this.stackName}-ApprovalStateMachine`,
      definitionBody: DefinitionBody.fromFile(
        path.join(
          __dirname,
          "../../src/state_machine/property_approval.asl.yaml"
        )
      ),
      definitionSubstitutions: {
        ContractExistsChecker: contractExistsCheckerFunction.functionArn,
        WaitForContractApproval: waitForContractApprovalFunction.functionArn,
        ContentIntegrityValidator:
          contentIntegrityValidatorFunction.functionArn,
        ImageUploadBucketName: imagesBucketName,
        EventBusName: eventBus.eventBusName,
        ServiceName: UNICORN_PROPERTIES_NAMESPACE,
      },
      tracingEnabled: true,
      logs: {
        level: LogLevel.ALL,
        includeExecutionData: true,
        destination: stateMachineLogGroup,
      },
      role: new iam.Role(this, "StateMachineRole", {
        assumedBy: new iam.ServicePrincipal("states.amazonaws.com"),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AWSXRayDaemonWriteAccess"
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "ComprehendBasicAccessPolicy"
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "RekognitionDetectOnlyPolicy"
          ),
        ],
        inlinePolicies: {
          CloudWatchPublishLogsMetrics: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: [
                  "logs:CreateLogDelivery",
                  "logs:GetLogDelivery",
                  "logs:UpdateLogDelivery",
                  "logs:DeleteLogDelivery",
                  "logs:ListLogDeliveries",
                  "logs:PutResourcePolicy",
                  "logs:DescribeResourcePolicies",
                  "logs:DescribeLogGroups",
                  "cloudwatch:PutMetricData]",
                ],
                resources: ["*"],
              }),
            ],
          }),
          S3ReadPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ["s3:Get*"],
                resources: [`arn:aws:s3:::${imagesBucketName}/*`],
              }),
            ],
          }),
        },
      }),
    });
    stateMachine.grantTaskResponse(propertiesApprovalSyncFunction);
    eventBus.grantPutEventsTo(stateMachine);
    waitForContractApprovalFunction.grantInvoke(stateMachine);
    contentIntegrityValidatorFunction.grantInvoke(stateMachine);
    contractExistsCheckerFunction.grantInvoke(stateMachine);

    new events.Rule(this, "unicorn.properties-PublicationApprovalRequested", {
      ruleName: "unicorn.properties-PublicationApprovalRequested",
      eventBus: eventBus,
      eventPattern: {
        source: [UNICORN_WEB_NAMESPACE],
        detailType: ["PublicationApprovalRequested"],
      },
    }).addTarget(
      new targets.SfnStateMachine(stateMachine, {
        deadLetterQueue: eventBusDLQ,
      })
    );

    /*
    Outputs
    */

    // DYNAMODB OUTPUTS
    new CfnOutput(this, "ContractStatusTableName", {
      value: table.tableName,
      description: "DynamoDB table storing contract status information",
    });

    // #### LAMBDA FUNCTIONS OUTPUTS
    new CfnOutput(this, "ContractStatusChangedHandlerFunctionName", {
      value: contractStatusChangedHandlerFunction.functionName,
    });
    new CfnOutput(this, "ContractStatusChangedHandlerFunctionArn", {
      value: contractStatusChangedHandlerFunction.functionArn,
    });

    new CfnOutput(this, "PropertiesApprovalSyncFunctionName", {
      value: propertiesApprovalSyncFunction.functionName,
    });
    new CfnOutput(this, "PropertiesApprovalSyncFunctionArn", {
      value: propertiesApprovalSyncFunction.functionArn,
    });

    new CfnOutput(this, "ContractExistsCheckerFunctionNName", {
      value: contractExistsCheckerFunction.functionName,
    });
    new CfnOutput(this, "ContractExistsCheckerFunctionArn", {
      value: contractExistsCheckerFunction.functionArn,
    });

    new CfnOutput(this, "ContentIntegrityValidatorFunctionNName", {
      value: contentIntegrityValidatorFunction.functionName,
    });
    new CfnOutput(this, "ContentIntegrityValidatorFunctionArn", {
      value: contentIntegrityValidatorFunction.functionArn,
    });

    new CfnOutput(this, "WaitForContractApprovalFunctionNName", {
      value: waitForContractApprovalFunction.functionName,
    });
    new CfnOutput(this, "WaitForContractApprovalFunctionArn", {
      value: waitForContractApprovalFunction.functionArn,
    });

    // #### STEPFUNCTIONS OUTPUTS
    new CfnOutput(this, "ApprovalStateMachineName", {
      value: stateMachine.stateMachineName,
    });
    new CfnOutput(this, "ApprovalStateMachineArn", {
      value: stateMachine.stateMachineArn,
    });

    // #### EVENT BRIDGE OUTPUTS
    new CfnOutput(this, "UnicornPropertiesEventBusName", {
      value: eventBus.eventBusName,
    });

    // #### CLOUDWATCH LOGS OUTPUTS
    new CfnOutput(this, "UnicornPropertiesCatchAllLogGroupArn", {
      value: catchAllLogGroup.logGroupArn,
    });

    new CfnOutput(this, "ApprovalStateMachineLogGroupName", {
      value: stateMachineLogGroup.logGroupName,
    });
  }
}
