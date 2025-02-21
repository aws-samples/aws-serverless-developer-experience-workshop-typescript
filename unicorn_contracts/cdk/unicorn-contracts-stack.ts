import * as path from 'path';
import {
    Duration,
    RemovalPolicy,
    Stack,
    StackProps,
    Tags,
    CfnOutput,
} from 'aws-cdk-lib';
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
import ContractStatusChangedEventSchema from '../integration/ContractStatusChangedEventSchema.json';
import { Construct } from 'constructs';

export enum Stage {
    local = 'local',
    dev = 'dev',
    prod = 'prod',
}

interface UnicornConstractsStackProps extends StackProps {
    stage: Stage;
    serviceNamespace: string;
}

export class UnicornConstractsStack extends Stack {
    constructor(scope: Construct, id: string, props: UnicornConstractsStackProps) {
        super(scope, id, props);

        // Tag CloudFormation Stack
        Tags.of(this).add('namespace', props.serviceNamespace)
        Tags.of(this).add('stage', props.stage)
        Tags.of(this).add('project', 'AWS Serverless Developer Experience')

        // Set log retention period based on stage
        const logsRetentionPeriod = (stage: Stage) => {
            switch (stage) {
                case Stage.local:
                    return RetentionDays.ONE_DAY;
                case Stage.dev:
                    return RetentionDays.ONE_WEEK;
                case Stage.prod:
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
                eventBusName: `UnicornContractsBus-${props.stage}`
            }
        );

        // CloudWatch log group used to catch all events
        const catchAllLogGroup = new logs.LogGroup(this, 'CatchAllLogGroup', {
            logGroupName: `/aws/events/${props.stage}/${props.serviceNamespace}-catchall`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: retentionPeriod,
        });

        new events.EventBusPolicy(
            this,
            'ContractEventsBusPublishPolicy',
            {
                eventBus: eventBus,
                statementId: `OnlyContractsServiceCanPublishToEventBus-${props.stage}`,
                statement: new iam.PolicyStatement({
                    principals: [new iam.AccountRootPrincipal()],
                    actions: ['events:PutEvents'],
                    resources: [eventBus.eventBusArn],
                    conditions: {
                        StringEquals: {
                            'events:source': props.serviceNamespace,
                        },
                    },
                }).toJSON(),
            }
        );

        // Catchall rule used for development purposes.
        const catchAllRule = new events.Rule(this, 'contracts.catchall', {
            ruleName: 'contracts.catchall',
            description: 'Catch all events published by the contracts service.',
            eventBus: eventBus,
            eventPattern: {
                account: [this.account],
                source: [ props.serviceNamespace ],
            },
            enabled: true,
        });
        catchAllRule.addTarget(
            new targets.CloudWatchLogGroup(catchAllLogGroup)
        );

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
            tableName: `ContractsTable-${props.stage}`,
            partitionKey: {
                name: 'property_id',
                type: dynamodb.AttributeType.STRING,
            },
            dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: RemovalPolicy.DESTROY, // Be careful with this in production
        });

        /* -------------------------------------------------------------------------- */
        /*                             EVENT BRIDGE PIPES                             */
        /* -------------------------------------------------------------------------- */
        // Pipe to transform a changed Contracts table record to ContractStatusChanged and publish it via the UnicornContractsEventBus

        // Dead Letter Queue (DLQ) for the contract ingestion queue.
        // messages that fail processing after 1 attempt are moved here for investigation.
        // Messages are retained for 14 days (1,209,600 seconds).
        const pipeDLQ = new sqs.Queue(
            this,
            'ContractsTableStreamToEventPipeDLQ',
            {
                queueName: `ContractsTableStreamToEventPipeDLQ-${props.stage}`,
                encryption: sqs.QueueEncryption.SQS_MANAGED,
                retentionPeriod: Duration.days(14),
                removalPolicy: RemovalPolicy.DESTROY,
            }
        );

        const pipeRole = new iam.Role(this, 'pipe-role', {
            roleName: `ContractsTableStreamToEventPipeRole-${props.stage}`,
            description: 'IAM role for Pipe',
            assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com')
                .withConditions({
                    StringEquals: { 'aws:SourceAccount': Stack.of(this).account }
                }),
        });

        pipeRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [ 'dynamodb:ListStreams' ],
            resources: ["*"],
        }))
        pipeDLQ.grantSendMessages(pipeRole);
        table.grantStreamRead(pipeRole);
        eventBus.grantPutEventsTo(pipeRole);

        const ContractsTableStreamToEventPiptLogGroup = new logs.LogGroup(
            this,
            'ContractsTableStreamToEventPipeLogGroup',
            {
                removalPolicy: RemovalPolicy.DESTROY,
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
                    source: props.serviceNamespace,
                    detailType: 'ContractStatusChanged',
                },
                inputTemplate: JSON.stringify({
                    property_id: '<$.dynamodb.Key.property_id.S>',
                    contract_id: '<$.dynamodb.NewImage.contract_id.S>',
                    contract_status: '<$.dynamodb.NewImage.contract_status.S>',
                    contract_last_modified_on:
                        '<$.dynamodb.NewImage.contract_last_modified_on.S>',
                }),
            },
            logConfiguration: {
                cloudwatchLogsLogDestination: { logGroupArn: ContractsTableStreamToEventPiptLogGroup.logGroupArn },
                level: 'ERROR',
            },
        });

        /* -------------------------------------------------------------------------- */
        /*                             DEAD LETTER QUEUES                             */
        /* -------------------------------------------------------------------------- */
        // DeadLetterQueue for UnicornContractsIngestQueue. Contains messages that failed to be processed
        const IngestQueueDLQ = new sqs.Queue(this, 'UnicornContractsIngestDLQ', {
            queueName: `UnicornContractsIngestDLQ-${props.stage}`,
            retentionPeriod: Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /* -------------------------------------------------------------------------- */
        /*                                INGEST QUEUE                                */
        /* -------------------------------------------------------------------------- */
        // Queue API Gateway requests to be processed by ContractEventHandlerFunction
        const ingestQueue = new sqs.Queue(this, 'UnicornContractsIngestQueue', {
            queueName: `UnicornContractsIngestQueue-${props.stage}`,
            retentionPeriod: Duration.days(14),
            deadLetterQueue: {
                queue: IngestQueueDLQ,
                maxReceiveCount: 1,
            },
            visibilityTimeout: Duration.seconds(20),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /* -------------------------------------------------------------------------- */
        /*                              LAMBDA FUNCTIONS                              */
        /* -------------------------------------------------------------------------- */
        // Processes customer API requests from SQS queue UnicornContractsIngestQueue
        const eventHandlerLogs = new logs.LogGroup(
            this,
            'UnicornContractEventsHandlerLogs',
            {
                removalPolicy: RemovalPolicy.DESTROY,
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
                timeout: Duration.seconds(15),
                entry: path.join(
                    __dirname,
                    '../src/contracts_service/contractEventHandler.ts'
                ),
                logGroup: eventHandlerLogs,
                environment: {
                    DYNAMODB_TABLE: table.tableName,
                    SERVICE_NAMESPACE: props.serviceNamespace,
                    POWERTOOLS_LOGGER_CASE: 'PascalCase',
                    POWERTOOLS_SERVICE_NAME: props.serviceNamespace,
                    POWERTOOLS_TRACE_DISABLED: 'false', // Explicitly disables tracing, default
                    POWERTOOLS_LOGGER_LOG_EVENT: String(props.stage !== 'prod'),
                    POWERTOOLS_LOGGER_SAMPLE_RATE: props.stage !== 'prod' ? '0.1' : '0', // Debug log sampling percentage, default
                    POWERTOOLS_METRICS_NAMESPACE: props.serviceNamespace,
                    POWERTOOLS_LOG_LEVEL: 'INFO', // Log level for Logger (INFO, DEBUG, etc.), default
                    LOG_LEVEL: 'INFO', // Log level for Logger
                    NODE_OPTIONS: props.stage === 'prod' ? '' : '--enable-source-maps',
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
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const apiRole = new iam.Role(
            this,
            'UnicornContractsApiIntegrationRole',
            {
                roleName: `UnicornContractsApiIntegrationRole-${props.stage}`,
                assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            }
        );
        ingestQueue.grantSendMessages(apiRole);

        const api = new apigateway.RestApi(this, 'UnicornContractsApi', {
            description: "Unicorn Properties Contract Service API",
            cloudWatchRole: true,
            cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
            endpointTypes: [apigateway.EndpointType.REGIONAL],
            deployOptions: {
                stageName: props.stage,
                dataTraceEnabled: true,
                tracingEnabled: true,
                metricsEnabled: true,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                accessLogDestination: new apigateway.LogGroupLogDestination(
                    apiLogGroup
                ),
                accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
                    requestId: apigateway.AccessLogField.contextRequestId(),
                    'integration-error': apigateway.AccessLogField.contextIntegrationErrorMessage(),
                    'integration-status': '$context.integration.status',
                    'integration-latency': apigateway.AccessLogField.contextIntegrationLatency(),
                    'integration-request-id': apigateway.AccessLogField.contextAwsEndpointRequestId(),
                    'integration-integrationStatus': apigateway.AccessLogField.contextIntegrationStatus(),
                    'response-latency': apigateway.AccessLogField.contextResponseLatency(),
                    'status': apigateway.AccessLogField.contextStatus(),
                })),
                // accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                //     caller: false,
                //     httpMethod: true,
                //     ip: true,
                //     protocol: true,
                //     requestTime: true,
                //     resourcePath: true,
                //     responseLength: true,
                //     status: true,
                //     user: true,
                // }),
                methodOptions: {
                    '/*/*': {
                        throttlingRateLimit: 10,
                        throttlingBurstLimit: 100,
                        loggingLevel: props.stage === 'prod' 
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
                            number: { type: apigateway.JsonSchemaType.INTEGER, format: 'int32' },
                            street: { type: apigateway.JsonSchemaType.STRING },
                        },
                    },
                },
            },
        })

        // Request validator for the CreateContractModel
        const createContractValidator = new apigateway.RequestValidator(this, 'CreateContractValidator', {
            restApi: api,
            requestValidatorName: 'Validate CreateContract Body',
            validateRequestBody: true
        })

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
        })

        // Request validator for the UpdateContractModel
        const updateContractValidator = new apigateway.RequestValidator(this, 'UpdateContractValidator', {
            restApi: api,
            requestValidatorName: 'Validate Update Contract Body',
            validateRequestBody: true
        })

        apiRole.addToPolicy(
            new iam.PolicyStatement({
                actions: ['sqs:SendMessage', 'sqs:GetQueueUrl'],
                resources: [ingestQueue.queueArn],
            })
        );

        // const sqsIntegration = new apigateway.AwsIntegration({
        //     service: 'sqs',
        //     region: this.region,
        //     integrationHttpMethod: 'POST',
        //     path: ingestQueue.queueName,
        //     options: {
        //         credentialsRole: apiRole,
        //         integrationResponses: [
        //             {
        //                 statusCode: '200',
        //                 responseTemplates: {
        //                     'application/json': '{"message":"OK"}',
        //                 },
        //             },
        //         ],
        //         requestParameters: {
        //             'integration.request.header.Content-Type':
        //                 "'application/x-www-form-urlencoded'",
        //         },
        //         passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        //         requestTemplates: {
        //             'application/json':
        //                 'Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String',
        //         },
        //     },
        // });

        const contractsApiResource = api.root.addResource('contracts', {
            defaultIntegration: new apigateway.AwsIntegration({
                service: 'sqs',
                integrationHttpMethod: 'POST',
                path: ingestQueue.queueName,
                options: {
                    credentialsRole: apiRole,
                    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
                    integrationResponses: [{
                        statusCode: '200',
                        responseTemplates: {
                            'application/json': '{"message":"OK"}',
                        },
                    }],
                    requestTemplates: {
                        'application/json': 'Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String',
                    },
                    requestParameters: {
                        'integration.request.header.Content-Type':
                            "'application/x-www-form-urlencoded'",
                    }
                },
            })
        });

        // Add POST method to /contracts with validation
        contractsApiResource.addMethod('POST', undefined, {
            requestValidator: createContractValidator,
            requestModels: {
                'application/json': createContractModel,
            },
            methodResponses: [{
                statusCode: '200',
                responseModels: {
                    'application/json': apigateway.Model.EMPTY_MODEL,
                },
            }],
        })

        // Add PUT method to /contracts with validation
        contractsApiResource.addMethod('PUT', undefined, {
            requestValidator: updateContractValidator,
            requestModels: {
                'application/json': updateContractModel,
            },
            methodResponses: [{
                statusCode: '200',
                responseModels: {
                    'application/json': apigateway.Model.EMPTY_MODEL,
                },
            }],
        })

        /* -------------------------------------------------------------------------- */
        /*                                Events Schema                               */
        /* -------------------------------------------------------------------------- */

        const registry = new eventschemas.CfnRegistry(this, 'EventRegistry', {
            registryName: `${props.serviceNamespace}-${props.stage}`,
            description: `Event schemas for Unicorn Contracts ${props.stage}`,
        });

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

        const registryPolicy = new eventschemas.CfnRegistryPolicy(this, 'RegistryPolicy', {
            registryName: registry.attrRegistryName,
            policy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        principals: [new iam.AccountPrincipal(Stack.of(this).account)],
                        actions: [
                            "schemas:DescribeCodeBinding",
                            "schemas:DescribeRegistry",
                            "schemas:DescribeSchema",
                            "schemas:GetCodeBindingSource",
                            "schemas:ListSchemas",
                            "schemas:ListSchemaVersions",
                            "schemas:SearchSchemas",
                        ],
                        resources: [
                            registry.attrRegistryArn,
                            `arn:aws:schemas:${Stack.of(this).region}:${Stack.of(this).account}:schema/${registry.attrRegistryName}*`,
                        ],
                    }),
                ],
            })
        })
        registryPolicy.node.addDependency(contractStatusChangedSchema);

        /* -------------------------------------------------------------------------- */
        /*                                  Subscribe                                 */
        /* -------------------------------------------------------------------------- */
        
        // Allow event subscribers to create subscription rules on this event bus
        eventBus.addToResourcePolicy(new iam.PolicyStatement({
            sid: 'AllowSubscribersToCreateSubscriptionRules',
            effect: iam.Effect.ALLOW,
            principals: [ new iam.AccountRootPrincipal()],
            actions: [
                'events:*Rule',
                'events:*Targets'
            ],
            resources: [ eventBus.eventBusArn ],
            conditions: {
                StringEqualsIfExists: {
                    'events:creatorAccount': Stack.of(this).account,
                },
                // TO DO - Review if below are valid as they may not apply to PutRule/PutTargets as per https://aws.amazon.com/blogs/compute/simplifying-cross-account-access-with-amazon-eventbridge-resource-policies/
                // StringEquals: {
                //     'event:source': [props.serviceNamespace],
                // },
                // Null: {
                //     'events:source': 'false',
                // }
            }
        }))

        /* -------------------------------------------------------------------------- */
        /*                                   Outputs                                  */
        /* -------------------------------------------------------------------------- */
        new CfnOutput(this, 'ApiUrl', {
            description: 'Web service API endpoint',
            value: api.url,
        });

        new CfnOutput(this, 'IngestQueueUrl', {
            description: 'URL for the Ingest SQS Queue',
            value: ingestQueue.queueUrl,
        });

        new CfnOutput(this, 'ContractsTableName', {
            description: 'DynamoDB table storing contract information',
            value: table.tableName,
        });

        new CfnOutput(this, 'ContractEventHandlerFunctionName', {
            description: 'ContractEventHandler function name',
            value: contractEventHandlerLambda.functionName,
        });
        new CfnOutput(this, 'ContractEventHandlerFunctionArn', {
            description: 'ContractEventHandler function ARN',
            value: contractEventHandlerLambda.functionArn,
        });

        new CfnOutput(this, 'UnicornContractsEventBusName', {
            value: eventBus.eventBusName,
        });

        new CfnOutput(this, 'UnicornContractsCatchAllLogGroupArn', {
            description: "Log all events on the service's EventBridge Bus",
            value: catchAllLogGroup.logGroupArn,
        });
    }
}
