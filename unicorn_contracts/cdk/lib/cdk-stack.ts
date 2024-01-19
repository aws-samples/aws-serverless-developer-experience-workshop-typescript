import * as fs from 'fs';
import * as path from 'path';
const yaml = require('js-yaml');
import { render } from 'mustache';
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

import { LogsRetentionPeriod, Stage, isProd } from '../bin/cdk';

interface UnicornConstractsStackProps extends StackProps {
  stage: Stage,
}

export class UnicornConstractsStack extends Stack {
  constructor(scope: App, id: string, props: UnicornConstractsStackProps) {
    super(scope, id, props);

    const retentionPeriod = LogsRetentionPeriod(props.stage);

    /*
      Existing SSM Parameters
    */
    const contractsNamespace = ssm.StringParameter.valueFromLookup(this, `/uni-prop/${props.stage}/UnicornContractsNamespace`);
    const propertiesNamespace = ssm.StringParameter.valueFromLookup(this, `/uni-prop/${props.stage}/UnicornPropertiesNamespace`);
    const webNamespace = ssm.StringParameter.valueFromLookup(this, `/uni-prop/${props.stage}/UnicornWebNamespace`);
    Tags.of(this).add('namespace', contractsNamespace);


    /*
      EVENT BUS
    */
    const eventBus = new events.EventBus(this, `UnicornContractstBus-${props.stage}`, {
      eventBusName: `UnicornContractstBus-${props.stage}`
    });

    // CloudWatch log group used to catch all events
    const catchAllLogGroup = new logs.LogGroup(this, 'CatchAllLogGroup', {
      logGroupName: `/aws/events/${props.stage}/${contractsNamespace}-catchall`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: retentionPeriod
    })
    const eventBusPolicy = new events.EventBusPolicy(this, 'ContractEventsBusPublishPolicy', {
      eventBus: eventBus,
      statementId: `OnlyContactsServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
        conditions: { StringEquals: { 'events:Source': contractsNamespace } }
      }).toJSON(),
    });

    // Catchall rule used for development purposes.
    const catchAllRule = new events.Rule(this, 'contracts.catchall', {
      description: "Catch all events published by the contracts service.",
      eventPattern: {
        source: [propertiesNamespace, webNamespace],
        account: [this.account]
      },
      enabled: true,
      targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)]
    })
    const eventBridgeRole = new iam.Role(this, 'events-role', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });
    catchAllLogGroup.grantWrite(eventBridgeRole);

    /*
      Share Event bus through SSM
    */
    const eventBusParam = new ssm.StringParameter(this,
      'UnicornContractsEventBusNameParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBus`,
      stringValue: eventBus.eventBusName
    });

    const eventBusArnParam = new ssm.StringParameter(this, 'UnicornContractsEventBusArnParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBusArn`,
      stringValue: eventBus.eventBusArn
    });

    /*
      DYNAMODB TABLE
      Persist Contracts information in DynamoDB
    */
    const table = new dynamodb.TableV2(this, `ContractsTable`, {
      tableName: `ContractsTable-${props.stage}`,
      partitionKey: { name: "property_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      billing: dynamodb.Billing.onDemand()
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
    eventBus.grantPutEventsTo(pipeRole);

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
      target: eventBus.eventBusArn,
      targetParameters: {
        eventBridgeEventBusParameters: {
          source: contractsNamespace,
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
        SERVICE_NAMESPACE: contractsNamespace,
        POWERTOOLS_LOGGER_CASE: "PascalCase",
        POWERTOOLS_SERVICE_NAME: contractsNamespace,
        POWERTOOLS_TRACE_DISABLED: "false", // Explicitly disables tracing, default
        POWERTOOLS_LOGGER_LOG_EVENT: isProd(props.stage) ? "false" : "true", // Logs incoming event, default
        POWERTOOLS_LOGGER_SAMPLE_RATE: isProd(props.stage) ? "0.1" : "0", // Debug log sampling percentage, default
        POWERTOOLS_METRICS_NAMESPACE: contractsNamespace,
        POWERTOOLS_LOG_LEVEL: "INFO", // Log level for Logger (INFO, DEBUG, etc.), default
        LOG_LEVEL: "INFO" // Log level for Logger
      },
    })
    ingestQueue.grantConsumeMessages(contractEventHandlerLambda);
    eventHandlerLogs.grantWrite(contractEventHandlerLambda);
    table.grantReadWriteData(contractEventHandlerLambda)
    const eventSource = new SqsEventSource(ingestQueue, {enabled: true, batchSize: 1, maxConcurrency: 5});
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
      inlinePolicies: {
        'AllowSqsIntegration':
          new iam.PolicyDocument({
            statements: [new iam.PolicyStatement({
              actions: ['sqs:SendMessage', 'sqs:GetQueueUrl'],
              resources: [ingestQueue.queueArn],
            })],
          })
      }
    });

    const openApiParms = {
      ingestQueueName: ingestQueue.queueName,
      apiRoleArn: apiRole.roleArn,
      region: Stack.of(this).region,
      accountId: this.account
    };

    console.log(JSON.stringify(this.resolve(openApiParms)));
    const openApiSpec = this.resolve(yaml.load(render(fs.readFileSync(path.join(__dirname, '../../api.yaml'), 'utf-8'), openApiParms)));
    console.log(JSON.stringify(openApiSpec));

    const api = new apigateway.SpecRestApi(this, 'api', {
      apiDefinition: apigateway.ApiDefinition.fromInline(openApiSpec),
      cloudWatchRole: true,
      deployOptions: {
        stageName: props.stage,
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(apiLogs),
        accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
          "requestId": "$context.requestId",
          "integration-error": "$context.integration.error",
          "integration-status": "$context.integration.status",
          "integration-latency": "$context.integration.latency",
          "integration-requestId": "$context.integration.requestId",
          "integration-integrationStatus": "$context.integration.integrationStatus",
          "response-latency": "$context.responseLatency",
          "status": "$context.status",
        })),
        methodOptions: {
          '/*/*': {
            loggingLevel: isProd(props.stage) ? apigateway.MethodLoggingLevel.ERROR : apigateway.MethodLoggingLevel.INFO,
            throttlingBurstLimit: 10,
            throttlingRateLimit: 100
          }

        }
      },
      endpointTypes: [apigateway.EndpointType.REGIONAL],
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
    new CfnOutput(this, 'UnicornContractsEventBusName', { value: eventBus.eventBusName });

    /*
     CLOUDWATCH LOGS OUTPUTS
    */
    new CfnOutput(this, 'UnicornContractsCatchAllLogGroupArn', {
      description: "Log all events on the service's EventBridge Bus",
      value: catchAllLogGroup.logGroupArn
    })
  }
}
