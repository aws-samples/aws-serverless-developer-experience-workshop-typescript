import * as path from 'path';
import { Duration, RemovalPolicy, Stack, StackProps, App, Tags, CfnOutput, Fn } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { LogsRetentionPeriod, Stage, isProd, UNICORN_CONTRACTS_NAMESPACE, UNICORN_PROPERTIES_NAMESPACE, UNICORN_WEB_NAMESPACE } from 'unicorn_shared';
import { SubscriberPoliciesStack } from './subscriber-policies';
import { EventsSchemaStack } from './event-schemas';

interface UnicornConstractsStackProps extends StackProps {
  stage: Stage,
}

export class UnicornConstractsStack extends Stack {
  public readonly eventBus: events.EventBus;
  constructor(scope: App, id: string, props: UnicornConstractsStackProps) {
    super(scope, id, props);

    const retentionPeriod = LogsRetentionPeriod(props.stage);

    /*
      EVENT BUS
    */
    this.eventBus = new events.EventBus(this, `UnicornContractsBus-${props.stage}`, {
      eventBusName: `UnicornContractsBus-${props.stage}`
    });

    // CloudWatch log group used to catch all events
    const catchAllLogGroup = new logs.LogGroup(this, 'CatchAllLogGroup', {
      logGroupName: `/aws/events/${props.stage}/${UNICORN_CONTRACTS_NAMESPACE}-catchall`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: retentionPeriod
    })
    const eventBusPolicy = new events.EventBusPolicy(this, 'ContractEventsBusPublishPolicy', {
      eventBus: this.eventBus,
      statementId: `OnlyContactsServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [this.eventBus.eventBusArn],
        conditions: { StringEquals: { 'events:Source': UNICORN_CONTRACTS_NAMESPACE } }
      }).toJSON(),
    });

    // Catchall rule used for development purposes.
    const catchAllRule = new events.Rule(this, 'contracts.catchall', {
      description: "Catch all events published by the contracts service.",
      eventBus: this.eventBus,
      eventPattern: {
        source: [UNICORN_PROPERTIES_NAMESPACE, UNICORN_WEB_NAMESPACE, UNICORN_CONTRACTS_NAMESPACE],
        account: [this.account]
      },
      enabled: true,
    })
    catchAllRule.addTarget(new targets.CloudWatchLogGroup(catchAllLogGroup));

    /*
     Share Event bus through SSM
   */
    const eventBusParam = new ssm.StringParameter(this,
      'UnicornContractsEventBusNameParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBus`,
      stringValue: this.eventBus.eventBusName
    });

    const eventBusArnParam = new ssm.StringParameter(this, 'UnicornContractsEventBusArnParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBusArn`,
      stringValue: this.eventBus.eventBusArn
    });

    /*
      DYNAMODB TABLE
      Persist Contracts information in DynamoDB
    */
    const table = new dynamodb.TableV2(this, `ContractsTable`, {
      tableName: `uni-prop-${props.stage}-contracts-ContractStatusTable`,
      partitionKey: { name: "property_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    }
    )

    /* 
      Event Bridge Pipes
      Pipe to transform a changed Contracts table record to ContractStatusChanged and publish it via the UnicornContractsEventBus
    */

    const pipeDLQ = new sqs.Queue(this, 'ContractsTableStreamToEventPipeDLQ', {
      removalPolicy: RemovalPolicy.DESTROY,
      retentionPeriod: Duration.days(14),
      queueName: `ContractsTableStreamToEventPipeDLQ-${props.stage}`,
    });

    const pipeRole = new iam.Role(this, 'pipe-role', {
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
    });

    pipeDLQ.grantSendMessages(pipeRole);
    table.grantStreamRead(pipeRole);
    this.eventBus.grantPutEventsTo(pipeRole);

    const pipe = new CfnPipe(this, 'ContractsTableStreamToEventPipe', {
      roleArn: pipeRole.roleArn,
      source: table.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          maximumRetryAttempts: 3,
          deadLetterConfig: {
            arn: pipeDLQ.queueArn
          },
          startingPosition: 'LATEST',
          onPartialBatchItemFailure: 'AUTOMATIC_BISECT',
          batchSize: 1,
        },
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify(
                {
                  eventName: ["INSERT", "MODIFY"],
                  dynamodb: { NewImage: { contract_status: { S: ["DRAFT", "APPROVED"] } } }
                }
              )
            }
          ]
        }
      },
      target: this.eventBus.eventBusArn,
      targetParameters: {
        eventBridgeEventBusParameters: {
          source: UNICORN_CONTRACTS_NAMESPACE,
          detailType: 'ContractStatusChanged'
        },
        inputTemplate: JSON.stringify({
          property_id: "<$.dynamodb.NewImage.property_id.S>",
          contract_id: "<$.dynamodb.NewImage.contract_id.S>",
          contract_status: "<$.dynamodb.NewImage.contract_status.S>",
          contract_last_modified_on: "<$.dynamodb.NewImage.contract_last_modified_on.S>"
        })
      }

    })

    /*
      DEAD LETTER QUEUES
      DeadLetterQueue for UnicornContractsIngestQueue. Contains messages that failed to be processed
    */
    const IngestQueueDLQ = new sqs.Queue(this, 'UnicornContractsIngestDLQ', {
      removalPolicy: RemovalPolicy.DESTROY,
      retentionPeriod: Duration.days(14),
      queueName: `UnicornContractsIngestDLQ-${props.stage}`,
    });


    /*
      INGEST QUEUE
      Queue API Gateway requests to be processed by ContractEventHandlerFunction
    */
    const ingestQueue = new sqs.Queue(this, 'UnicornContractsIngestQueue', {
      removalPolicy: RemovalPolicy.DESTROY,
      retentionPeriod: Duration.days(14),
      queueName: `UnicornContractsIngestQueue-${props.stage}`,
      deadLetterQueue: {
        queue: IngestQueueDLQ,
        maxReceiveCount: 1
      },
      visibilityTimeout: Duration.seconds(20)
    });


    /*
      LAMBDA FUNCTIONS
      Processes customer API requests from SQS queue UnicornContractsIngestQueue
    */
    const eventHandlerLogs = new logs.LogGroup(this, 'UnicornContractEventsHandlerLogs', {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: retentionPeriod
    })
    const contractEventHandlerLambda = new nodejs.NodejsFunction(this, `ContractEventHandlerFunction-${props.stage}`, {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "lambdaHandler",
      tracing: lambda.Tracing.ACTIVE,
      entry: path.join(__dirname, '../../src/contracts_service/contractEventHandler.ts'),
      logGroup: eventHandlerLogs,
      environment: {
        DYNAMODB_TABLE: table.tableName,
        SERVICE_NAMESPACE: UNICORN_CONTRACTS_NAMESPACE,
        POWERTOOLS_LOGGER_CASE: "PascalCase",
        POWERTOOLS_SERVICE_NAME: UNICORN_CONTRACTS_NAMESPACE,
        POWERTOOLS_TRACE_DISABLED: "false", // Explicitly disables tracing, default
        POWERTOOLS_LOGGER_LOG_EVENT: isProd(props.stage) ? "false" : "true", // Logs incoming event, default
        POWERTOOLS_LOGGER_SAMPLE_RATE: isProd(props.stage) ? "0.1" : "0", // Debug log sampling percentage, default
        POWERTOOLS_METRICS_NAMESPACE: UNICORN_CONTRACTS_NAMESPACE,
        POWERTOOLS_LOG_LEVEL: "INFO", // Log level for Logger (INFO, DEBUG, etc.), default
        LOG_LEVEL: "INFO" // Log level for Logger
      },
    })
    eventHandlerLogs.grantWrite(contractEventHandlerLambda);
    table.grantReadWriteData(contractEventHandlerLambda)
    ingestQueue.grantConsumeMessages(contractEventHandlerLambda);
    const eventSource = new SqsEventSource(ingestQueue, { enabled: true, batchSize: 1, maxConcurrency: 5 });
    contractEventHandlerLambda.addEventSource(eventSource);

    /*
      API GATEWAY REST API
    */
    const apiLogs = new logs.LogGroup(this, 'UnicornContractsApiLogGroup', {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: retentionPeriod
    })

    const apiRole = new iam.Role(this, 'UnicornContractsApiIntegrationRole', {
      roleName: 'UnicornContractsApiIntegrationRole',
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    ingestQueue.grantSendMessages(apiRole);

    const api = new apigateway.RestApi(this, 'UnicornContractsApi', {
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
      deployOptions: {
        stageName: props.stage,
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(apiLogs),
        methodOptions: {
          '/*/*': {
            loggingLevel: isProd(props.stage) ? apigateway.MethodLoggingLevel.ERROR : apigateway.MethodLoggingLevel.INFO,
          }

        }
      },
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    })

    apiRole.addToPolicy(new iam.PolicyStatement({
      actions: ['sqs:SendMessage', 'sqs:GetQueueUrl'],
      resources: [ingestQueue.queueArn]
    }))

    const sqsIntegration = new apigateway.AwsIntegration({
      service: 'sqs',
      region: this.region,
      integrationHttpMethod: 'POST',
      path: ingestQueue.queueName,
      options: {
        credentialsRole: apiRole,
        integrationResponses: [{
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"message":"OK"}'
          }
        }],
        requestParameters: {
          'integration.request.header.Content-Type':
            "'application/x-www-form-urlencoded'"
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": "Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String"
        },
      },
    });

    const contractsApiResource = api.root.addResource('contracts');

    contractsApiResource.addMethod('POST', sqsIntegration, { methodResponses: [{ statusCode: '200' }] });
    contractsApiResource.addMethod('PUT', sqsIntegration, { methodResponses: [{ statusCode: '200' }] });

    /* Events Schema */
    const schemaStack = new EventsSchemaStack(this, `uni-prop-${props.stage}-contracts-EventSchemaSack`, {
      stage: props.stage,
      namespace: UNICORN_CONTRACTS_NAMESPACE,
    });
    /* Subscriptions */
    const subscriberStack = new SubscriberPoliciesStack(this, `uni-prop-${props.stage}-contracts-SubscriptionsStack`, {
      stage: props.stage,
      eventBus: this.eventBus,
      namespace: UNICORN_CONTRACTS_NAMESPACE,
    })

    /*
      Outputs
    */

    /*
     API GATEWAY OUTPUTS
    */
    new CfnOutput(this, 'ApiUrl', {
      description: 'Web service API endpoint',
      value: api.url
    })

    /*
      SQS OUTPUTS
    */
    new CfnOutput(this, 'IngestQueueUrl', {
      description: 'URL for the Ingest SQS Queue',
      value: ingestQueue.queueUrl
    });
    /*
      DYNAMODB OUTPUTS
    */
    new CfnOutput(this, 'ContractsTableName', {
      description: 'DynamoDB table storing contract information',
      value: table.tableName
    });

    /*
     LAMBDA FUNCTIONS OUTPUTS
    */
    new CfnOutput(this, 'ContractEventHandlerFunctionName', {
      description: 'ContractEventHandler function name',
      value: contractEventHandlerLambda.functionName
    });
    new CfnOutput(this, 'ContractEventHandlerFunctionArn', {
      description: 'ContractEventHandler function ARN',
      value: contractEventHandlerLambda.functionArn
    });
    /*
     EVENT BRIDGE OUTPUTS
    */
    new CfnOutput(this, 'UnicornContractsEventBusName', { value: this.eventBus.eventBusName });

    /*
     CLOUDWATCH LOGS OUTPUTS
    */
    new CfnOutput(this, 'UnicornContractsCatchAllLogGroupArn', {
      description: "Log all events on the service's EventBridge Bus",
      value: catchAllLogGroup.logGroupArn
    })


  }
}
