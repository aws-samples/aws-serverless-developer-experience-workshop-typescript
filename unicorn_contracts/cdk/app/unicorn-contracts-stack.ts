// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

import { STAGE, UNICORN_NAMESPACES } from '../lib/helper';
import ContractStatusChangedEventSchema from '../../integration/ContractStatusChangedEventSchema.json';

interface UnicornConstractsStackProps extends cdk.StackProps {
  stage: STAGE;
}

export class UnicornConstractsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: UnicornConstractsStackProps
  ) {
    super(scope, id, props);

    // Tag CloudFormation Stack
    cdk.Tags.of(this).add('namespace', UNICORN_NAMESPACES.CONTRACTS);
    cdk.Tags.of(this).add('stage', props.stage);
    cdk.Tags.of(this).add('project', 'AWS Serverless Developer Experience');

    // Set log retention period based on stage
    const logsRetentionPeriod = (stage: STAGE) => {
      switch (stage) {
        case STAGE.local:
          return RetentionDays.ONE_DAY;
        case STAGE.dev:
          return RetentionDays.ONE_WEEK;
        case STAGE.prod:
          return RetentionDays.TWO_WEEKS;
        default:
          return RetentionDays.ONE_DAY;
      }
    };
    const retentionPeriod = logsRetentionPeriod(props.stage);

    /* -------------------------------------------------------------------------- */
    /*                                  EVENT BUS                                 */
    /* -------------------------------------------------------------------------- */

    const eventBus = new events.EventBus(
      this,
      `UnicornContractsBus-${props.stage}`,
      {
        eventBusName: `UnicornContractsBus-${props.stage}`,
      }
    );

    new events.EventBusPolicy(this, 'ContractEventsBusPublishPolicy', {
      eventBus: eventBus,
      statementId: `OnlyContractsServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEquals: {
            'events:source': UNICORN_NAMESPACES.CONTRACTS,
          },
        },
      }).toJSON(),
    });

    // CloudWatch log group used to catch all events
    const catchAllLogGroup = new logs.LogGroup(this, 'CatchAllLogGroup', {
      logGroupName: `/aws/events/${props.stage}/${UNICORN_NAMESPACES.CONTRACTS}-catchall`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: retentionPeriod,
    });

    // Catchall rule used for development purposes.
    new events.Rule(this, 'contracts.catchall', {
      ruleName: 'contracts.catchall',
      description: 'Catch all events published by the Contracts service.',
      eventBus: eventBus,
      eventPattern: {
        account: [this.account],
        source: [UNICORN_NAMESPACES.CONTRACTS],
      },
      enabled: true,
      targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
    });

    // Share Event bus Name through SSM
    new ssm.StringParameter(this, 'UnicornContractsEventBusNameParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBus`,
      stringValue: eventBus.eventBusName,
    });

    // Share Event bus Arn through SSM
    new ssm.StringParameter(this, 'UnicornContractsEventBusArnParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsEventBusArn`,
      stringValue: eventBus.eventBusArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                               DYNAMODB TABLE                               */
    /* -------------------------------------------------------------------------- */
    // Persist Contracts information in DynamoDB
    const table = new dynamodb.TableV2(this, `ContractsTable`, {
      tableName: `uni-prop-${props.stage}-contracts-ContractsTable`,
      partitionKey: {
        name: 'property_id',
        type: dynamodb.AttributeType.STRING,
      },
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Be careful with this in production
    });

    /* -------------------------------------------------------------------------- */
    /*                             EVENT BRIDGE PIPES                             */
    /* -------------------------------------------------------------------------- */
    // Pipe to transform a changed Contracts table record to ContractStatusChanged and publish it via the UnicornContractsEventBus

    // Dead Letter Queue (DLQ) for the contract ingestion queue.
    // messages that fail processing after 1 attempt are moved here for investigation.
    // Messages are retained for 14 days (1,209,600 seconds).
    const pipeDLQ = new sqs.Queue(this, 'ContractsTableStreamToEventPipeDLQ', {
      queueName: `ContractsTableStreamToEventPipeDLQ-${props.stage}`,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    NagSuppressions.addResourceSuppressions(pipeDLQ, [
      {
        id: 'AwsSolutions-SQS3',
        reason: 'This queue is used as a DLQ and does not require its own DLQ.',
      },
    ]);

    const pipeRole = new iam.Role(this, 'pipe-role', {
      roleName: `ContractsTableStreamToEventPipeRole-${props.stage}`,
      description: 'IAM role for Pipe',
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com').withConditions(
        {
          StringEquals: { 'aws:SourceAccount': cdk.Stack.of(this).account },
        }
      ),
    });

    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:ListStreams'],
        resources: ['*'],
      })
    );
    pipeDLQ.grantSendMessages(pipeRole);
    table.grantStreamRead(pipeRole);
    eventBus.grantPutEventsTo(pipeRole);

    const ContractsTableStreamToEventPipeLogGroup = new logs.LogGroup(
      this,
      'ContractsTableStreamToEventPipeLogGroup',
      {
        logGroupName: `/aws/pipe/${props.stage}/ContractsTableStreamToEventPipe`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: retentionPeriod,
      }
    );

    new CfnPipe(this, 'ContractsTableStreamToEventPipe', {
      roleArn: pipeRole.roleArn,
      source: table.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          maximumRetryAttempts: 3,
          deadLetterConfig: {
            arn: pipeDLQ.queueArn,
          },
          startingPosition: 'LATEST',
          // onPartialBatchItemFailure: 'AUTOMATIC_BISECT', // TO DO - Not implemented on SAM template
          batchSize: 1,
        },
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify({
                eventName: ['INSERT', 'MODIFY'],
                dynamodb: {
                  NewImage: {
                    contract_status: {
                      S: ['DRAFT', 'APPROVED'],
                    },
                  },
                },
              }),
            },
          ],
        },
      },
      target: eventBus.eventBusArn,
      targetParameters: {
        eventBridgeEventBusParameters: {
          source: UNICORN_NAMESPACES.CONTRACTS,
          detailType: 'ContractStatusChanged',
        },
        inputTemplate: JSON.stringify({
          property_id: '<$.dynamodb.Keys.property_id.S>',
          contract_id: '<$.dynamodb.NewImage.contract_id.S>',
          contract_status: '<$.dynamodb.NewImage.contract_status.S>',
          contract_last_modified_on:
            '<$.dynamodb.NewImage.contract_last_modified_on.S>',
        }),
      },
      logConfiguration: {
        cloudwatchLogsLogDestination: {
          logGroupArn: ContractsTableStreamToEventPipeLogGroup.logGroupArn,
        },
        level: 'ERROR',
      },
    });

    /* -------------------------------------------------------------------------- */
    /*                             DEAD LETTER QUEUES                             */
    /* -------------------------------------------------------------------------- */
    // DeadLetterQueue for UnicornContractsIngestQueue. Contains messages that failed to be processed
    const IngestQueueDLQ = new sqs.Queue(this, 'UnicornContractsIngestDLQ', {
      queueName: `UnicornContractsIngestDLQ-${props.stage}`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /* -------------------------------------------------------------------------- */
    /*                                INGEST QUEUE                                */
    /* -------------------------------------------------------------------------- */
    // Queue API Gateway requests to be processed by ContractEventHandlerFunction
    const ingestQueue = new sqs.Queue(this, 'UnicornContractsIngestQueue', {
      queueName: `UnicornContractsIngestQueue-${props.stage}`,
      retentionPeriod: cdk.Duration.days(14),
      deadLetterQueue: {
        queue: IngestQueueDLQ,
        maxReceiveCount: 1,
      },
      visibilityTimeout: cdk.Duration.seconds(20),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /* -------------------------------------------------------------------------- */
    /*                              LAMBDA FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */
    // Processes customer API requests from SQS queue UnicornContractsIngestQueue
    const eventHandlerLogs = new logs.LogGroup(
      this,
      'UnicornContractEventsHandlerLogs',
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: retentionPeriod,
      }
    );

    const contractEventHandlerLambda = new nodejs.NodejsFunction(
      this,
      `ContractEventHandlerFunction-${props.stage}`,
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'lambdaHandler',
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(15),
        entry: path.join(
          __dirname,
          '../../src/contracts_service/contractEventHandler.ts'
        ),
        logGroup: eventHandlerLogs,
        environment: {
          DYNAMODB_TABLE: table.tableName,
          SERVICE_NAMESPACE: UNICORN_NAMESPACES.CONTRACTS,
          NODE_OPTIONS: props.stage === 'prod' ? '' : '--enable-source-maps',
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_SERVICE_NAME: UNICORN_NAMESPACES.CONTRACTS,
          POWERTOOLS_TRACE_DISABLED: 'false', // Explicitly disables tracing, default
          POWERTOOLS_LOGGER_LOG_EVENT: String(props.stage !== 'prod'),
          POWERTOOLS_LOGGER_SAMPLE_RATE: props.stage !== 'prod' ? '0.1' : '0', // Debug log sampling percentage, default
          POWERTOOLS_METRICS_NAMESPACE: UNICORN_NAMESPACES.CONTRACTS,
          POWERTOOLS_LOG_LEVEL: 'INFO', // Log level for Logger (INFO, DEBUG, etc.), default
          LOG_LEVEL: 'INFO', // Log level for Logger
        },
      }
    );
    table.grantReadWriteData(contractEventHandlerLambda);
    ingestQueue.grantConsumeMessages(contractEventHandlerLambda);
    contractEventHandlerLambda.addEventSource(
      new SqsEventSource(ingestQueue, { batchSize: 1, maxConcurrency: 5 })
    );

    /* -------------------------------------------------------------------------- */
    /*                             API GATEWAY REST API                            */
    /* -------------------------------------------------------------------------- */
    const apiLogGroup = new logs.LogGroup(this, 'UnicornContractsApiLogGroup', {
      retention: retentionPeriod,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const apiRole = new iam.Role(this, 'UnicornContractsApiIntegrationRole', {
      roleName: `UnicornContractsApiIntegrationRole-${props.stage}`,
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    ingestQueue.grantSendMessages(apiRole);

    const api = new apigateway.RestApi(this, 'UnicornContractsApi', {
      description: 'Unicorn Properties Contract Service API',
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deployOptions: {
        stageName: props.stage,
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.OFF,
        accessLogDestination: new apigateway.LogGroupLogDestination(
          apiLogGroup
        ),
        accessLogFormat: apigateway.AccessLogFormat.custom(
          JSON.stringify({
            requestId: apigateway.AccessLogField.contextRequestId(),
            'integration-error':
              apigateway.AccessLogField.contextIntegrationErrorMessage(),
            'integration-status': '$context.integration.status',
            'integration-latency':
              apigateway.AccessLogField.contextIntegrationLatency(),
            'integration-request-id':
              apigateway.AccessLogField.contextAwsEndpointRequestId(),
            'integration-integrationStatus':
              apigateway.AccessLogField.contextIntegrationStatus(),
            'response-latency':
              apigateway.AccessLogField.contextResponseLatency(),
            status: apigateway.AccessLogField.contextStatus(),
          })
        ),
        methodOptions: {
          '/*/*': {
            throttlingRateLimit: 10,
            throttlingBurstLimit: 100,
            loggingLevel:
              props.stage === 'prod'
                ? apigateway.MethodLoggingLevel.ERROR
                : apigateway.MethodLoggingLevel.INFO,
          },
        },
      },
    });

    // JSON Schema validation model for contract creation requests.
    const createContractModel = api.addModel('CreateContractModel', {
      modelName: 'CreateContractModel',
      contentType: 'application/json',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,
        required: ['property_id', 'seller_name', 'address'],
        properties: {
          property_id: { type: apigateway.JsonSchemaType.STRING },
          seller_name: { type: apigateway.JsonSchemaType.STRING },
          address: {
            type: apigateway.JsonSchemaType.OBJECT,
            required: ['city', 'country', 'number', 'street'],
            properties: {
              city: { type: apigateway.JsonSchemaType.STRING },
              country: { type: apigateway.JsonSchemaType.STRING },
              number: {
                type: apigateway.JsonSchemaType.INTEGER,
                format: 'int32',
              },
              street: { type: apigateway.JsonSchemaType.STRING },
            },
          },
        },
      },
    });

    // Request validator for the CreateContractModel
    const createContractValidator = new apigateway.RequestValidator(
      this,
      'CreateContractValidator',
      {
        restApi: api,
        requestValidatorName: 'Validate CreateContract Body',
        validateRequestBody: true,
      }
    );

    // JSON Schema validation model for contract update requests.
    const updateContractModel = api.addModel('UpdateContractModel', {
      modelName: 'UpdateContractModel',
      contentType: 'application/json',
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        type: apigateway.JsonSchemaType.OBJECT,
        required: ['property_id'],
        properties: {
          property_id: { type: apigateway.JsonSchemaType.STRING },
          // TO DO - Check SAM implementation. The Open API spec refers back to CreateContractModel specification
        },
      },
    });

    // Request validator for the UpdateContractModel
    const updateContractValidator = new apigateway.RequestValidator(
      this,
      'UpdateContractValidator',
      {
        restApi: api,
        requestValidatorName: 'Validate Update Contract Body',
        validateRequestBody: true,
      }
    );

    apiRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sqs:SendMessage', 'sqs:GetQueueUrl'],
        resources: [ingestQueue.queueArn],
      })
    );

    const contractsApiResource = api.root.addResource('contracts', {
      defaultIntegration: new apigateway.AwsIntegration({
        service: 'sqs',
        integrationHttpMethod: 'POST',
        path: ingestQueue.queueName,
        options: {
          credentialsRole: apiRole,
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              statusCode: '200',
              responseTemplates: {
                'application/json': '{"message":"OK"}',
              },
            },
          ],
          requestTemplates: {
            'application/json':
              'Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String',
          },
          requestParameters: {
            'integration.request.header.Content-Type':
              "'application/x-www-form-urlencoded'",
          },
        },
      }),
    });

    // Add POST method to /contracts with validation
    contractsApiResource.addMethod('POST', undefined, {
      requestValidator: createContractValidator,
      requestModels: {
        'application/json': createContractModel,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
      ],
    });

    // Add PUT method to /contracts with validation
    contractsApiResource.addMethod('PUT', undefined, {
      requestValidator: updateContractValidator,
      requestModels: {
        'application/json': updateContractModel,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
      ],
    });

    NagSuppressions.addResourceSuppressions(
      api,
      [
        { id: 'AwsSolutions-APIG2', reason: 'Validation not required' },
        { id: 'AwsSolutions-APIG3', reason: 'Does not require WAF' },
        {
          id: 'AwsSolutions-APIG4',
          reason: 'Authorization not implemented for this workshop.',
        },
        {
          id: 'AwsSolutions-COG4',
          reason: 'Authorization not implemented for this workshop.',
        },
      ],
      true
    );

    /* -------------------------------------------------------------------------- */
    /*                                Events Schema                               */
    /* -------------------------------------------------------------------------- */

    const registry = new eventschemas.CfnRegistry(this, 'EventRegistry', {
      registryName: `${UNICORN_NAMESPACES.CONTRACTS}-${props.stage}`,
      description: `Event schemas for Unicorn Contracts ${props.stage}`,
    });

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
                new iam.AccountPrincipal(cdk.Stack.of(this).account),
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
                `arn:aws:schemas:${cdk.Stack.of(this).region}:${
                  cdk.Stack.of(this).account
                }:schema/${registry.attrRegistryName}*`,
              ],
            }),
          ],
        }),
      }
    );

    const contractStatusChangedSchema = new eventschemas.CfnSchema(
      this,
      'ContractStatusChangedEventSchema',
      {
        type: 'OpenApi3',
        registryName: registry.attrRegistryName,
        description: 'The schema for a request to publish a property',
        schemaName: `${registry.attrRegistryName}@ContractStatusChanged`,
        content: JSON.stringify(ContractStatusChangedEventSchema),
      }
    );
    registryPolicy.node.addDependency(contractStatusChangedSchema);

    /* -------------------------------------------------------------------------- */
    /*                                  Subscribe                                 */
    /* -------------------------------------------------------------------------- */

    // Allow event subscribers to create subscription rules on this event bus
    eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: `AllowSubscribersToCreateSubscriptionRules-contracts-${props.stage}`,
        effect: iam.Effect.ALLOW,
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:*Rule', 'events:*Targets'],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEqualsIfExists: {
            'events:creatorAccount': cdk.Stack.of(this).account,
          },
          // TO DO - Review if below are valid as they may not apply to PutRule/PutTargets as per https://aws.amazon.com/blogs/compute/simplifying-cross-account-access-with-amazon-eventbridge-resource-policies/
          // StringEquals: {
          //     'event:source': [UNICORN_NAMESPACES.CONTRACTS],
          // },
          // Null: {
          //     'events:source': 'false',
          // }
        },
      })
    );

    NagSuppressions.addResourceSuppressions(
      [
        apiLogGroup,
        catchAllLogGroup,
        ContractsTableStreamToEventPipeLogGroup,
        eventHandlerLogs,
      ],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Custom Resource to set Log Retention Policy',
        },
      ]
    );

    /* -------------------------------------------------------------------------- */
    /*                                   Outputs                                  */
    /* -------------------------------------------------------------------------- */
    new cdk.CfnOutput(this, 'ApiUrl', {
      description: 'Web service API endpoint',
      value: api.url,
    });

    new cdk.CfnOutput(this, 'IngestQueueUrl', {
      description: 'URL for the Ingest SQS Queue',
      value: ingestQueue.queueUrl,
    });

    new cdk.CfnOutput(this, 'ContractsTableName', {
      description: 'DynamoDB table storing contract information',
      value: table.tableName,
    });

    new cdk.CfnOutput(this, 'ContractEventHandlerFunctionName', {
      description: 'ContractEventHandler function name',
      value: contractEventHandlerLambda.functionName,
    });
    new cdk.CfnOutput(this, 'ContractEventHandlerFunctionArn', {
      description: 'ContractEventHandler function ARN',
      value: contractEventHandlerLambda.functionArn,
    });

    new cdk.CfnOutput(this, 'UnicornContractsEventBusName', {
      value: eventBus.eventBusName,
    });

    new cdk.CfnOutput(this, 'UnicornContractsCatchAllLogGroupArn', {
      description: "Log all events on the service's EventBridge Bus",
      value: catchAllLogGroup.logGroupArn,
    });
  }
}
