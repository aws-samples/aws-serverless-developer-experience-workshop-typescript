import * as path from 'path';

import {
    Duration,
    RemovalPolicy,
    Stack,
    StackProps,
    App,
    Tags,
    CfnOutput,
} from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import {
    DynamoEventSource,
    SqsDlq,
} from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Stage, UNICORN_NAMESPACES } from './helper'
import PublicationEvaluationCompleted from '../../integration/PublicationEvaluationCompleted.json';

interface UnicornPropertiesStackProps extends StackProps {
    stage: Stage;
}

export class UnicornPropertiesStack extends Stack {
    public readonly eventBus: events.EventBus;
    private readonly stage: Stage;
    private readonly retentionPeriod: logs.RetentionDays;

    constructor(scope: App, id: string, props: UnicornPropertiesStackProps) {
        super(scope, id, props);
        this.stage = props.stage;
        this.retentionPeriod = this.getLogsRetentionPriod();

        // Add CloudFormation stack tags
        this.addStackTags();

        // Create infrastructure components
        const DLQs = this.createDeadLetterQueues();
        const table = this.createDynamoDBTable();
        const catchAllLogGroup = this.createCatchAllLogGroup();
        
        // Create Event Bus and related resources
        this.eventBus = this.createEventBus();
        this.configureEventBusPolicy();
        this.createCatchAllRule(catchAllLogGroup);
        this.createEventBusSSMParameters();
    
        // Create Lambda Functions
        const lambdaFunctions = this.createLambdaFunctions(table, DLQs);
        
        // Create State Machine
        const { stateMachine, stateMachineLogGroup } = this.createStateMachine(lambdaFunctions, DLQs);
    
        // Create Event Rules
        this.createEventRules(lambdaFunctions, stateMachine, DLQs);
    
        // Create Event Schema Registry
        this.createEventSchemaRegistry();
    
        // Create Stack Outputs
        this.createStackOutputs(table, lambdaFunctions, stateMachine, stateMachineLogGroup, catchAllLogGroup);

    }

  private getLogsRetentionPriod(): logs.RetentionDays {
    // Set log retention period based on stage
    switch (this.stage) {
      case Stage.local:
          return logs.RetentionDays.ONE_DAY;
      case Stage.dev:
          return logs.RetentionDays.ONE_WEEK;
      case Stage.prod:
          return logs.RetentionDays.TWO_WEEKS;
      default:
          return logs.RetentionDays.ONE_DAY;
    }
  }

  private addStackTags(): void {
    Tags.of(this).add('namespace', UNICORN_NAMESPACES.PROPERTIES);
    Tags.of(this).add('stage', this.stage);
    Tags.of(this).add('project', 'AWS Serverless Developer Experience');
  }

  private createDeadLetterQueues(): Record<string, sqs.Queue> {
    // Object to store all our Dead Letter Queues
    const DLQs: Record<string, sqs.Queue> = {};

    // Store EventBridge events that failed to be DELIVERED to ContractStatusChangedHandlerFunction
    DLQs.eventBusDLQ = new sqs.Queue(this, 'PropertiesEventBusRuleDLQ', {
        queueName: `PropertiesEventBusRuleDLQ-${this.stage}`,
        retentionPeriod: Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        removalPolicy: RemovalPolicy.DESTROY,
    });

    // Store failed INVOCATIONS to each Lambda function in Unicorn Properties Service
    DLQs.propertiesServiceDLQ = new sqs.Queue(
        this,
        'PropertiesServiceDLQ',
        {
            queueName: `PropertiesServiceDLQ-${this.stage}`,
            retentionPeriod: Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
        }
    );
    return DLQs;
  }

  private createDynamoDBTable() {
    return new dynamodb.TableV2(this, `ContractStatusTable`, {
      tableName: `uni-prop-${this.stage}-properties-ContractStatusTable`,
      partitionKey: {
          name: 'property_id',
          type: dynamodb.AttributeType.STRING,
      },
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.DESTROY, // be careful with this in production
    });
  }

  private createCatchAllLogGroup() {
    return new logs.LogGroup(
      this,
      'UnicornPropertiesCatchAllLogGroup',
      {
          logGroupName: `/aws/events/${this.stage}/${UNICORN_NAMESPACES.PROPERTIES}-catchall`,
          removalPolicy: RemovalPolicy.DESTROY,
          retention: this.retentionPeriod,
      }
    );
  }
        
  private createEventBus() {
    return new events.EventBus(
      this,
      `UnicornPropertiesBus-${this.stage}`,
      {
          eventBusName: `UnicornPropertiesBus-${this.stage}`,
      }
    );
  }

  private configureEventBusPolicy() {
    // Event bus policy to restrict who can publish events (should only be services from UnicornPropertiesNamespace)
    new events.EventBusPolicy(
      this,
      'UnicornPropertiesEventsBusPublishPolicy',
      {
          eventBus: this.eventBus,
          statementId: `OnlyPropertiesServiceCanPublishToEventBus-${this.stage}`,
          statement: new iam.PolicyStatement({
              principals: [new iam.AccountRootPrincipal()],
              actions: ['events:PutEvents'],
              resources: [this.eventBus.eventBusArn],
              conditions: {
                  StringEquals: {
                      'events:source': UNICORN_NAMESPACES.PROPERTIES,
                  },
              },
          }).toJSON(),
      }
    );
  }

  private createCatchAllRule(catchAllLogGroup: logs.LogGroup) {
    // Catchall rule used for development purposes.
    new events.Rule(this, 'properties.catchall', {
      ruleName: 'properties.catchall',
      description:
          'Catch all events published by the Properties service.',
      eventBus: this.eventBus,
      eventPattern: {
          account: [this.account],
          source: [UNICORN_NAMESPACES.PROPERTIES],
      },
      enabled: true,
      targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
  });
  };

  private createEventBusSSMParameters() {
    // Share Event bus Name through SSM
    new ssm.StringParameter(this, 'UnicornPropertiesEventBusNameParam', {
      parameterName: `/uni-prop/${this.stage}/UnicornPropertiesEventBus`,
      stringValue: this.eventBus.eventBusName,
    });

    // Share Event bus Arn through SSM
    new ssm.StringParameter(this, 'UnicornPropertiesEventBusArnParam', {
      parameterName: `/uni-prop/${this.stage}/UnicornPropertiesEventBusArn`,
      stringValue: this.eventBus.eventBusArn,
    });
  };
  
  private getDefaultLambdaOptions(contractStatusTable: dynamodb.TableV2, propertiesServiceDLQ: sqs.Queue): nodejs.NodejsFunctionProps {
    return {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambdaHandler',
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 128,
      timeout: Duration.seconds(15),
      architecture: lambda.Architecture.X86_64,
      environment: {
          CONTRACT_STATUS_TABLE: contractStatusTable.tableName,
          EVENT_BUS: this.eventBus.eventBusName,
          SERVICE_NAMESPACE: UNICORN_NAMESPACES.PROPERTIES,
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_SERVICE_NAME: UNICORN_NAMESPACES.PROPERTIES,
          POWERTOOLS_TRACE_DISABLED: 'false', // Explicitly disables tracing, default
          POWERTOOLS_LOGGER_LOG_EVENT: String(this.stage !== 'prod'),
          POWERTOOLS_LOGGER_SAMPLE_RATE:
              this.stage !== 'prod' ? '0.1' : '0', // Debug log sampling percentage, default
          POWERTOOLS_METRICS_NAMESPACE: UNICORN_NAMESPACES.PROPERTIES,
          POWERTOOLS_LOG_LEVEL: 'INFO', // Log level for Logger (INFO, DEBUG, etc.), default
          LOG_LEVEL: 'INFO', // Log level for Logger
          NODE_OPTIONS:
              this.stage === 'prod' ? '' : '--enable-source-maps',
      },
      deadLetterQueue: propertiesServiceDLQ,
    }
  }

  private createLambdaFunctions(table: dynamodb.TableV2, DLQs: Record<string, sqs.Queue>): Record<string, nodejs.NodejsFunction> {
    const defaultLambdaOptions = this.getDefaultLambdaOptions(table, DLQs.propertiesServiceDLQ);

    const lambdaFunctions: Record<string, nodejs.NodejsFunction> = {};
    
    /* Listens to ContractStatusChanged events from EventBridge */
    lambdaFunctions.contractStatusChangedHandler = new nodejs.NodejsFunction(
      this,
      `ContractEventHandlerFunction-${this.stage}`,
      {
          ...defaultLambdaOptions,
          entry: path.join(
              __dirname,
              '../../src/properties_service/contractStatusChangedEventHandler.ts'
          ),
          logGroup: new logs.LogGroup(
              this,
              'ContractStatusChangedHandlerFunctionLogGroup',
              {
                  removalPolicy: RemovalPolicy.DESTROY,
                  retention: this.retentionPeriod,
              }
          ),
      }
    );

    // Listens to Contract status changes from ContractStatusTable to un-pause StepFunctions
    lambdaFunctions.propertiesApprovalSyncHandler = new nodejs.NodejsFunction(
      this,
      `PropertiesApprovalSyncFunction`,
      {
          ...defaultLambdaOptions,
          entry: path.join(
              __dirname,
              '../../src/properties_service/propertiesApprovalSyncFunction.ts'
          ),
          logGroup: new logs.LogGroup(
              this,
              'PropertiesApprovalSyncFunctionLogGroup',
              {
                  retention: this.retentionPeriod,
              }
          ),
      }
    );

    // Part of the ApprovalStateMachine, checks if a given Property has an existing Contract in ContractStatusTable
    lambdaFunctions.contractExistsCheckerHandler = new nodejs.NodejsFunction(
      this,
      `ContractExistsCheckerFunction`,
      {
          ...defaultLambdaOptions,
          entry: path.join(
              __dirname,
              '../../src/properties_service/contractExistsCheckerFunction.ts'
          ),
          logGroup: new logs.LogGroup(
              this,
              'ContractExistsCheckerFunctionLogGroup',
              {
                  retention: this.retentionPeriod,
              }
          ),
      }
    );

    lambdaFunctions.waitForContractApprovalHandler = new nodejs.NodejsFunction(
      this,
      `WaitForContractApprovalFunction`,
      {
          ...defaultLambdaOptions,
          entry: path.join(
              __dirname,
              '../../src/properties_service/waitForContractApprovalFunction.ts'
          ),
          logGroup: new logs.LogGroup(
              this,
              'WaitForContractApprovalFunctionLogGroup',
              {
                  retention: this.retentionPeriod,
              }
          ),
      }
    );

    // Part of the ApprovalStateMachine, validates if all outputs of content checking steps are OK
    lambdaFunctions.contentIntegrityValidatorHandler = new nodejs.NodejsFunction(
      this,
      `ContentIntegrityValidatorFunction`,
      {
          ...defaultLambdaOptions,
          entry: path.join(
              __dirname,
              '../../src/properties_service/contentIntegrityValidatorFunction.ts'
          ),
          logGroup: new logs.LogGroup(
              this,
              'ContentIntegrityValidatorFunctionLogGroup',
              {
                  retention: this.retentionPeriod,
              }
          ),
      }
    );

    // Set up permissions and event sources
    this.configureLambdaPermissions(lambdaFunctions, table, DLQs);

    return lambdaFunctions;
  };

  private configureLambdaPermissions(
    lambdaFunctions: Record<string, nodejs.NodejsFunction>,
    table: dynamodb.TableV2,
    DLQs: Record<string, sqs.Queue>,
  ): void {
    // allow Contract Status Changed function to read and write from Contract Status DynamoDB table
    table.grantReadWriteData(lambdaFunctions.contractStatusChangedHandler)

    // Allow Properties Approval Sync function to send messages to the Properties Service Dead Letter Queue
    DLQs.propertiesServiceDLQ.grantSendMessages(lambdaFunctions.propertiesApprovalSyncHandler)
    
    // Allow Properties Approval Sync function to read data and stream data from Contract Status DynamoDB table
    table.grantReadData(lambdaFunctions.propertiesApprovalSyncHandler)
    table.grantStreamRead(lambdaFunctions.propertiesApprovalSyncHandler)

    // Add DynamoDB Stream as an event source for the Properties Approval Sync Function
    lambdaFunctions.propertiesApprovalSyncHandler.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        onFailure: new SqsDlq(DLQs.propertiesServiceDLQ),
      })
    )

    // Allow Contract Exists Checker function to read data from Contract Status DynamoDB table
    table.grantReadData(lambdaFunctions.contractExistsCheckerHandler)

    // Allow Wait For Contract Approval function to read and write data from Contract Status DynamoDB table
    table.grantReadWriteData(lambdaFunctions.waitForContractApprovalHandler)
  }
        

  private createStateMachine(lambdaFunctions: Record<string, nodejs.NodejsFunction>, DLQs: Record<string, sqs.Queue>) {
    const imagesBucketName =
            ssm.StringParameter.valueForTypedStringParameterV2(
                this,
                `/uni-prop/${this.stage}/ImagesBucket`,
                ssm.ParameterValueType.STRING
            );
    const stateMachineLogGroup = new logs.LogGroup(
        this,
        'ApprovalStateMachineLogGroup',
        {
            retention: this.retentionPeriod,
        }
    );
    const stateMachine = new sfn.StateMachine(this, `ApprovalStateMachine`, {
      stateMachineName: `${this.stackName}-ApprovalStateMachine`,
      definitionBody: sfn.DefinitionBody.fromFile(
          path.join(
              __dirname,
              '../../src/state_machine/property_approval.asl.yaml'
          )
      ),
      definitionSubstitutions: {
          ContractExistsChecker:
              lambdaFunctions.contractExistsCheckerHandler.functionArn,
          WaitForContractApproval:
              lambdaFunctions.waitForContractApprovalHandler.functionArn,
          ContentIntegrityValidator:
              lambdaFunctions.contentIntegrityValidatorHandler.functionArn,
          ImageUploadBucketName: imagesBucketName,
          EventBusName: this.eventBus.eventBusName,
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
              iam.ManagedPolicy.fromAwsManagedPolicyName(
                  'ComprehendFullAccess'
              ),
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
                          resources: [
                              `arn:aws:s3:::${imagesBucketName}/*`,
                          ],
                      }),
                  ],
              }),
          },
      }),
    });
    // State machine permissions
    stateMachine.grantTaskResponse(lambdaFunctions.propertiesApprovalSyncHandler)
    this.eventBus.grantPutEventsTo(stateMachine)
    lambdaFunctions.waitForContractApprovalHandler.grantInvoke(stateMachine)
    lambdaFunctions.contentIntegrityValidatorHandler.grantInvoke(stateMachine)
    lambdaFunctions.contractExistsCheckerHandler.grantInvoke(stateMachine)

    return { stateMachine, stateMachineLogGroup };
  };
    
  private createEventRules(lambdaFunctions: Record<string, nodejs.NodejsFunction>, stateMachine: sfn.StateMachine, DLQs: Record<string, sqs.Queue>) {
    // Add EventBridge Rule as event source for the Contract Status Changed function
    new events.Rule(this, 'unicorn.properties-ContractStatusChanged', {
      ruleName: 'unicorn.properties-ContractStatusChanged',
      description:
          'ContractStatusChanged events published by the Contracts service.',
      eventBus: this.eventBus,
      eventPattern: {
          source: [UNICORN_NAMESPACES.CONTRACTS],
          detailType: ['ContractStatusChanged'],
      },
      enabled: true,
      targets: [
          new targets.LambdaFunction(lambdaFunctions.contractStatusChangedHandler, {
            deadLetterQueue: DLQs.eventBusDLQ,
            retryAttempts: 5,
            maxEventAge: Duration.minutes(15),
          }),
      ],
    })

    // Add event source for state machine
    new events.Rule(
      this, 'unicorn.properties-PublicationApprovalRequested', {
        ruleName: 'unicorn.properties-PublicationApprovalRequested',
        description:
          'PublicationApprovalRequested events published by the Web service.',
        eventBus: this.eventBus,
        eventPattern: {
          source: [UNICORN_NAMESPACES.WEB],
          detailType: ['PublicationApprovalRequested'],
        },
        enabled: true,
        targets: [
          new targets.SfnStateMachine(stateMachine, {
            deadLetterQueue: DLQs.eventBusDLQ,
            retryAttempts: 5,
            maxEventAge: Duration.minutes(15),
          }),
        ],
      }
    )
  };
    
  private createEventSchemaRegistry() {
    /* Events Schema */
    const registry = new eventschemas.CfnRegistry(this, 'EventRegistry', {
      registryName: `${UNICORN_NAMESPACES.PROPERTIES}-${this.stage}`,
      description: `Event schemas for Unicorn Properties ${this.stage}`,
    });

    const publicationEvaluationCompletedSchema = new eventschemas.CfnSchema(
        this,
        'PublicationEvaluationCompletedSchema',
        {
            type: 'OpenApi3',
            registryName: registry.attrRegistryName,
            description:
                'The schema for when a property evaluation is completed',
            schemaName: `${registry.attrRegistryName}@PublicationEvaluationCompleted`,
            content: JSON.stringify(PublicationEvaluationCompleted),
        }
    );

    const registryPolicy = new eventschemas.CfnRegistryPolicy(
        this,
        'RegistryPolicy',
        {
            registryName: registry.attrRegistryName,
            policy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        principals: [
                            new iam.AccountPrincipal(
                                Stack.of(this).account
                            ),
                        ],
                        actions: [
                            'schemas:DescribeCodeBinding',
                            'schemas:DescribeRegistry',
                            'schemas:DescribeSchema',
                            'schemas:GetCodeBindingSource',
                            'schemas:ListSchemas',
                            'schemas:ListSchemaVersions',
                            'schemas:SearchSchemas',
                        ],
                        resources: [
                            registry.attrRegistryArn,
                            `arn:aws:schemas:${Stack.of(this).region}:${
                                Stack.of(this).account
                            }:schema/${registry.attrRegistryName}*`,
                        ],
                    }),
                ],
            }),
        }
    );
    registryPolicy.node.addDependency(publicationEvaluationCompletedSchema);

    // Allow Subscribers to create their own subscription rules
    this.eventBus.addToResourcePolicy(
        new iam.PolicyStatement({
            sid: `AllowSubscribersToCreateSubscriptionRules-properties-${this.stage}`,
            effect: iam.Effect.ALLOW,
            principals: [new iam.AccountRootPrincipal()],
            actions: ['events:*Rule', 'events:*Targets'],
            resources: [this.eventBus.eventBusArn],
            conditions: {
                StringEqualsIfExists: {
                    'events:creatorAccount': Stack.of(this).account,
                },
            },
        })
    );
  };
    
  private createStackOutputs(
    table: dynamodb.TableV2,
    lambdaFunctions: Record<string, nodejs.NodejsFunction>,
    stateMachine: sfn.StateMachine,
    stateMachineLogGroup: logs.LogGroup,
    catchAllLogGroup: logs.LogGroup
  ): void {
    // Lambda Function ARNs
    new CfnOutput(this, 'ContractStatusChangedHandlerFunctionArn', {
        value: lambdaFunctions.contractStatusChangedHandler.functionArn,
    });
    new CfnOutput(this, 'PropertiesApprovalSyncFunctionArn', {
      value: lambdaFunctions.propertiesApprovalSyncHandler.functionArn,
    });
    new CfnOutput(this, 'ContractExistsCheckerFunctionArn', {
      value: lambdaFunctions.contractExistsCheckerHandler.functionArn,
    });
    new CfnOutput(this, 'ContentIntegrityValidatorFunctionArn', {
      value: lambdaFunctions.contentIntegrityValidatorHandler.functionArn,
    });
    new CfnOutput(this, 'WaitForContractApprovalFunctionArn', {
      value: lambdaFunctions.waitForContractApprovalHandler.functionArn,
    });

    // Lambda Function Names
    new CfnOutput(this, 'ContractStatusChangedHandlerFunctionName', {
      value: lambdaFunctions.contractStatusChangedHandler.functionName,
    });
    new CfnOutput(this, 'PropertiesApprovalSyncFunctionName', {
        value: lambdaFunctions.propertiesApprovalSyncHandler.functionName,
    });
    new CfnOutput(this, 'ContractExistsCheckerFunctionName', {
        value: lambdaFunctions.contractExistsCheckerHandler.functionName,
    });
    new CfnOutput(this, 'ContentIntegrityValidatorFunctionNName', {
        value: lambdaFunctions.contentIntegrityValidatorHandler.functionName,
    });
    new CfnOutput(this, 'WaitForContractApprovalFunctionNName', {
        value: lambdaFunctions.waitForContractApprovalHandler.functionName,
    });

    // DynamoDB Table Name
    new CfnOutput(this, 'ContractStatusTableName', {
      value: table.tableName,
      description: 'DynamoDB table storing contract status information',
    });

    // Step Function Outputs
    new CfnOutput(this, 'ApprovalStateMachineName', {
      value: stateMachine.stateMachineName,
    });
    new CfnOutput(this, 'ApprovalStateMachineArn', {
        value: stateMachine.stateMachineArn,
    });

    // EventBridge Names
    new CfnOutput(this, 'UnicornPropertiesEventBusName', {
        value: this.eventBus.eventBusName,
    });

    // CloudWatch Logs Outputs
    new CfnOutput(this, 'UnicornPropertiesCatchAllLogGroupArn', {
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupArn,
    });

    new CfnOutput(this, 'ApprovalStateMachineLogGroupName', {
        value: stateMachineLogGroup.logGroupName,
    });


  };

}
