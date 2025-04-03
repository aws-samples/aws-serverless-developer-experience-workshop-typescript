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

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { CfnSchema } from 'aws-cdk-lib/aws-eventschemas';

import { Stage, UNICORN_NAMESPACES } from './helper'

interface UnicornWebStackProps extends StackProps {
    stage: Stage;
}

// Unicorn Web Service - web interface. Add, list and get details for Unicorn Properties.
export class UnicornWebStack extends Stack {
    public readonly eventBus: events.EventBus;

    constructor(scope: App, id: string, props: UnicornWebStackProps) {
        super(scope, id, props);

        // Tag CloudFormation Stack
        Tags.of(this).add('namespace', UNICORN_NAMESPACES.WEB)
        Tags.of(this).add('stage', props.stage)
        Tags.of(this).add('project', 'AWS Serverless Developer Experience')

        // Set log retention period based on stage
        const logsRetentionPeriod = (stage: Stage) => {
            switch (stage) {
                case Stage.local:
                    return logs.RetentionDays.ONE_DAY;
                case Stage.dev:
                    return logs.RetentionDays.ONE_WEEK;
                case Stage.prod:
                    return logs.RetentionDays.TWO_WEEKS;
                default:
                    return logs.RetentionDays.ONE_DAY;
            }
        };
        const retentionPeriod = logsRetentionPeriod(props.stage);

        /* -------------------------------------------------------------------------- */
        /*                                  EVENT BUS                                 */
        /* -------------------------------------------------------------------------- */
        // Event bus for Unicorn Web Service used to publish and consume events
        this.eventBus = new events.EventBus(
            this,
            `UnicornWebBus-${props.stage}`,
            {
                eventBusName: `UnicornWebBus-${props.stage}`,
            }
        );

        // Event bus policy to restrict who can publish events (should only be services from UnicornWebNamespace)
        new events.EventBusPolicy(this, 'UnicornWebEventsBusPublishPolicy', {
            eventBus: this.eventBus,
            statementId: `OnlyWebServiceCanPublishToEventBus-${props.stage}`,
            statement: new iam.PolicyStatement({
                principals: [new iam.AccountRootPrincipal()],
                actions: ['events:PutEvents'],
                resources: [this.eventBus.eventBusArn],
                conditions: {
                    StringEquals: { 'events:source': UNICORN_NAMESPACES.WEB },
                },
            }).toJSON(),
        });

        // CloudWatch log group used to catch all events
        const catchAllLogGroup = new logs.LogGroup(this, 'UnicornWebCatchAllLogGroup', {
            logGroupName: `/aws/events/${props.stage}/${UNICORN_NAMESPACES.WEB}-catchall`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: retentionPeriod,
        });

        // Catchall rule used for development purposes.
        new events.Rule(this, 'web.catchall', {
            ruleName: 'web.catchall',
            description: 'Catch all events published by the Web service.',
            eventBus: this.eventBus,
            eventPattern: {
                account: [this.account],
                source: [ UNICORN_NAMESPACES.WEB ],
            },
            enabled: true,
            targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
        });

        // Share Event bus Name through SSM
        new ssm.StringParameter(this, 'UnicornWebEventBusNameParam', {
            parameterName: `/uni-prop/${props.stage}/UnicornWebEventBus`,
            stringValue: this.eventBus.eventBusName,
        });

        // Share Event bus Arn through SSM
        new ssm.StringParameter(this, 'UnicornWebEventBusArnParam', {
            parameterName: `/uni-prop/${props.stage}/UnicornWebEventBusArn`,
            stringValue: this.eventBus.eventBusArn,
        });

        /*
            DYNAMODB TABLE
            Persists Property details in DynamoDB
        */
        const table = new dynamodb.TableV2(this, `WebTable`, {
            tableName: `uni-prop-${props.stage}-web-WebTable`,
            partitionKey: {
                name: 'PK',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'SK',
                type: dynamodb.AttributeType.STRING,
            },
            dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: RemovalPolicy.DESTROY, // be careful with this in production
        });

        /* -------------------------------------------------------------------------- */
        /*                             DEAD LETTER QUEUES                             */
        /* -------------------------------------------------------------------------- */
        // DeadLetterQueue for UnicornWebIngestQueue. Contains messages that failed to be processed
        const ingestQueueDLQ = new sqs.Queue(this, 'WebIngestDLQ', {
            queueName: `WebIngestDLQ-${props.stage}`,
            retentionPeriod: Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /* -------------------------------------------------------------------------- */
        /*                                INGEST QUEUES                               */
        /* -------------------------------------------------------------------------- */
        // Queue API Gateway requests to be processed by RequestApprovalFunction
        const ingestQueue = new sqs.Queue(this, 'WebIngestQueue', {
            queueName: `WebIngestQueue-${props.stage}`,            
            deadLetterQueue: {
                queue: ingestQueueDLQ,
                maxReceiveCount: 1,
            },
            visibilityTimeout: Duration.seconds(20),
            retentionPeriod: Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            enforceSSL: true,            
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // Store failed Invocations for PublicationApprovedEventHandler function
        const publicationApprovedEventHandlerDLQ = new sqs.Queue(this, 'publicationApprovedEventHandlerDLQ', {
            queueName: `publicationApprovadEventHandlerDLQ-${props.stage}`,            
            retentionPeriod: Duration.days(14),
            encryption: sqs.QueueEncryption.SQS_MANAGED,
            enforceSSL: true,            
            removalPolicy: RemovalPolicy.DESTROY,
        });

        /* -------------------------------------------------------------------------- */
        /*                              Lambda Functions                              */
        /* -------------------------------------------------------------------------- */
        const defaultLambdaOptions: nodejs.NodejsFunctionProps = {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'lambdaHandler',
            tracing: lambda.Tracing.ACTIVE,
            memorySize: 128,
            timeout: Duration.seconds(15),
            architecture: lambda.Architecture.X86_64,
            environment: {
                DYNAMODB_TABLE: table.tableName,
                SERVICE_NAMESPACE: UNICORN_NAMESPACES.WEB,
                POWERTOOLS_LOGGER_CASE: 'PascalCase',
                POWERTOOLS_SERVICE_NAME: UNICORN_NAMESPACES.WEB,
                POWERTOOLS_TRACE_DISABLED: 'false', // Explicitly disables tracing, default
                POWERTOOLS_LOGGER_LOG_EVENT: String(props.stage !== 'prod'),
                POWERTOOLS_LOGGER_SAMPLE_RATE: props.stage !== 'prod' ? '0.1' : '0', // Debug log sampling percentage, default
                POWERTOOLS_METRICS_NAMESPACE: UNICORN_NAMESPACES.WEB,
                POWERTOOLS_LOG_LEVEL: 'INFO', // Log level for Logger (INFO, DEBUG, etc.), default
                LOG_LEVEL: 'INFO', // Log level for Logger
                NODE_OPTIONS: props.stage === 'prod' ? '' : '--enable-source-maps',
            },
        };

        // Handle Search and Property details requests from API
        const searchFunction = new nodejs.NodejsFunction(
            this,
            `SearchFunction-${props.stage}`,
            {
                ...defaultLambdaOptions,
                entry: path.join(
                    __dirname,
                    '../../src/search_service/propertySearchFunction.ts'
                ),
                logGroup: new logs.LogGroup(
                    this,
                    'PropertySearchFunctionLogs',
                    {
                        removalPolicy: RemovalPolicy.DESTROY,
                        retention: retentionPeriod,
                    }
                ),
            }
        );
        table.grantReadData(searchFunction);

        // Process queued API requests to approve properties from UnicornWebIngestQueue
        const requestApprovalFunction = new nodejs.NodejsFunction(
            this,
            `RequestApprovalFunction-${props.stage}`,
            {
                ...defaultLambdaOptions,
                entry: path.join(
                    __dirname,
                    '../../src/approvals_service/requestApprovalFunction.ts'
                ),
                environment: {
                    ...defaultLambdaOptions.environment,
                    EVENT_BUS: this.eventBus.eventBusName,
                },
                logGroup: new logs.LogGroup(
                    this,
                    'RequestApprovalFunctionLogs',
                    {
                        removalPolicy: RemovalPolicy.DESTROY,
                        retention: retentionPeriod,
                    }
                ),
                deadLetterQueueEnabled: true,
            }
        );
        
        this.eventBus.grantPutEventsTo(requestApprovalFunction);
        table.grantReadData(requestApprovalFunction);
        requestApprovalFunction.addEventSource(
            new SqsEventSource(ingestQueue, { batchSize: 1, maxConcurrency: 5 })
        );

        // Respond to PublicationEvaluationCompleted events from Unicorn Web EventBus
        const publicationApprovedEventHandlerFunction =
            new nodejs.NodejsFunction(this, `PublicationApprovedEventHandler`, {
                ...defaultLambdaOptions,
                entry: path.join(
                    __dirname,
                    '../../src/approvals_service/publicationApprovedEventHandler.ts'
                ),
                logGroup: new logs.LogGroup(this, 'PublicationApprovedLogs', {
                    removalPolicy: RemovalPolicy.DESTROY,
                    retention: retentionPeriod,
                }),
                deadLetterQueue: publicationApprovedEventHandlerDLQ,
            });

        table.grantWriteData(publicationApprovedEventHandlerFunction);
        new events.Rule(this, 'unicorn.web-PublicationEvaluationCompleted', {
            ruleName: 'unicorn.web-PublicationEvaluationCompleted',
            description: 'PublicationEvaluationCompleted events published by the Properties service.',
            eventBus: this.eventBus,
            eventPattern: {
                source: [UNICORN_NAMESPACES.PROPERTIES],
                detailType: ['PublicationEvaluationCompleted'],
            },
        }).addTarget(
            new targets.LambdaFunction(publicationApprovedEventHandlerFunction)
        );

        /* -------------------------- API GATEWAY REST API -------------------------- */
        const apiLogGroup = new logs.LogGroup(this, 'UnicornWebApiLogGroup', {
            retention: retentionPeriod,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const apiRole = new iam.Role(this, 'UnicornWebApiIntegrationRole', {
            roleName: `UnicornWebApiIntegrationRole-${props.stage}`,
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });
        ingestQueue.grantSendMessages(apiRole);
        searchFunction.grantInvoke(apiRole);

        const api = new apigateway.RestApi(this, 'UnicornWebApi', {
            cloudWatchRole: true,
            cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
            deployOptions: {
                stageName: props.stage,
                dataTraceEnabled: true,
                tracingEnabled: true,
                metricsEnabled: true,
                accessLogDestination: new apigateway.LogGroupLogDestination(
                    apiLogGroup
                ),
                methodOptions: {
                    '/*/*': {
                        loggingLevel: props.stage === 'prod'
                            ? apigateway.MethodLoggingLevel.ERROR
                            : apigateway.MethodLoggingLevel.INFO,
                    },
                },
            },
            endpointTypes: [apigateway.EndpointType.REGIONAL],
        });

        const sqsIntegration = new apigateway.AwsIntegration({
            service: 'sqs',
            region: this.region,
            integrationHttpMethod: 'POST',
            path: ingestQueue.queueName,
            options: {
                credentialsRole: apiRole,
                integrationResponses: [
                    {
                        statusCode: '200',
                        responseTemplates: {
                            'application/json': '{"message":"OK"}',
                        },
                    },
                ],
                requestParameters: {
                    'integration.request.header.Content-Type':
                        "'application/x-www-form-urlencoded'",
                },
                passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
                requestTemplates: {
                    'application/json':
                        'Action=SendMessage&MessageBody=$input.body&MessageAttribute.1.Name=HttpMethod&MessageAttribute.1.Value.StringValue=$context.httpMethod&MessageAttribute.1.Value.DataType=String',
                },
            },
        });

        api.root
            .addResource('request_approval')
            .addMethod('POST', sqsIntegration, {
                methodResponses: [{ statusCode: '200' }],
            });

        const searchResource = api.root.addResource('search', {
            defaultIntegration: new apigateway.LambdaIntegration(
                searchFunction
            ),
        });
        const listPropertiesByCountry = searchResource.addResource('{country}');
        listPropertiesByCountry.addMethod('GET');
        const listPropertiesByCity =
            listPropertiesByCountry.addResource('{city}');
        listPropertiesByCity.addMethod('GET');
        const listPropertiesByStreet =
            listPropertiesByCity.addResource('{street}');
        listPropertiesByStreet.addMethod('GET');

        const propertiesResource = api.root.addResource('properties');
        const propertyByCountry = propertiesResource.addResource('{country}');
        const propertyByCity = propertyByCountry.addResource('{city}');
        const propertyByStreet = propertyByCity.addResource('{street}');
        propertyByStreet
            .addResource('{number}', {
                defaultIntegration: new apigateway.LambdaIntegration(
                    searchFunction
                ),
            })
            .addMethod('GET');

        /* -------------------------------------------------------------------------- */
        /*                            Service Integrations                            */
        /* -------------------------------------------------------------------------- */

        /* ------------------------------ Events Schema ----------------------------- */

        const registry = new eventschemas.CfnRegistry(this, 'EventRegistry', {
            registryName: `${UNICORN_NAMESPACES.WEB}-${props.stage}`,
            description: `Event schemas for Unicorn Web ${props.stage}`,
        });

        const publicationApprovalRequestedSchema = new CfnSchema(
            this,
            'PublicationApprovalRequestedSchema',
            {
                type: 'OpenApi3',
                registryName: registry.attrRegistryName,
                schemaName: `${registry.attrRegistryName}@PublicationApprovalRequested`,
                description: 'The schema for a request to publish a property',
                content: JSON.stringify({
                    openapi: '3.0.0',
                    info: {
                        version: '1.0.0',
                        title: 'PublicationApprovalRequested',
                    },
                    paths: {},
                    components: {
                        schemas: {
                            AWSEvent: {
                                type: 'object',
                                required: [
                                    'detail-type',
                                    'resources',
                                    'detail',
                                    'id',
                                    'source',
                                    'time',
                                    'region',
                                    'version',
                                    'account',
                                ],
                                'x-amazon-events-detail-type':
                                    'PublicationApprovalRequested',
                                'x-amazon-events-source': registry.attrRegistryName,
                                properties: {
                                    detail: {
                                        $ref: '#/components/schemas/PublicationApprovalRequested',
                                    },
                                    account: {
                                        type: 'string',
                                    },
                                    'detail-type': {
                                        type: 'string',
                                    },
                                    id: {
                                        type: 'string',
                                    },
                                    region: {
                                        type: 'string',
                                    },
                                    resources: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    source: {
                                        type: 'string',
                                    },
                                    time: {
                                        type: 'string',
                                        format: 'date-time',
                                    },
                                    version: {
                                        type: 'string',
                                    },
                                },
                            },
                            PublicationApprovalRequested: {
                                type: 'object',
                                required: [
                                    'images',
                                    'address',
                                    'listprice',
                                    'contract',
                                    'description',
                                    'currency',
                                    'property_id',
                                    'status',
                                ],
                                properties: {
                                    address: {
                                        $ref: '#/components/schemas/Address',
                                    },
                                    contract: {
                                        type: 'string',
                                    },
                                    currency: {
                                        type: 'string',
                                    },
                                    description: {
                                        type: 'string',
                                    },
                                    images: {
                                        type: 'array',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    listprice: {
                                        type: 'string',
                                    },
                                    property_id: {
                                        type: 'string',
                                    },
                                    status: {
                                        type: 'string',
                                    },
                                },
                            },
                            Address: {
                                type: 'object',
                                required: [
                                    'country',
                                    'number',
                                    'city',
                                    'street',
                                ],
                                properties: {
                                    city: {
                                        type: 'string',
                                    },
                                    country: {
                                        type: 'string',
                                    },
                                    number: {
                                        type: 'string',
                                    },
                                    street: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                }),
            }
        );

        const registryPolicy = new eventschemas.CfnRegistryPolicy(this, "RegistryPolicy", {
            registryName: registry.attrRegistryName,
            policy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        sid: "AllowExternalServices",
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
            }),
        });
        registryPolicy.node.addDependency(publicationApprovalRequestedSchema);


        /* ------------------------------ Subscriptions ----------------------------- */
        // Update this policy as you get new subscribers by adding their namespace to events:source
        this.eventBus.addToResourcePolicy(new iam.PolicyStatement({
            sid: `AllowSubscribersToCreateSubscriptionRules-web-${props.stage}`,
            effect: iam.Effect.ALLOW,
            principals: [ new iam.AccountRootPrincipal()],
            actions: [
                'events:*Rule',
                'events:*Targets',
            ],
            resources: [ this.eventBus.eventBusArn ],
            conditions: {
                StringEqualsIfExists: {
                    'events:creatorAccount': Stack.of(this).account,
                },
            }
        }))
        

        /* -------------------------------------------------------------------------- */
        /*                                   OUTPUTS                                  */
        /* -------------------------------------------------------------------------- */
        // API GATEWAY OUTPUTS
        new CfnOutput(this, 'ApiUrl', {
            description: 'Web service API endpoint',
            value: api.url,
        });

        // API ACTIONS OUTPUTS
        new CfnOutput(this, 'ApiSearchProperties', {
            description: 'GET request to list all properties in a given city',
            value: `${api.url}search`,
        });

        new CfnOutput(this, 'ApiSearchPropertiesByCity', {
            description: 'GET request to list all properties in a given city',
            value: `${api.url}search/{country}/{city}`,
        });
        new CfnOutput(this, 'ApiSearchPropertiesByStreet', {
            description: 'GET request to list all properties in a given street',
            value: `${api.url}search/{country}/{city}/{street}`,
        });

        new CfnOutput(this, 'ApiPropertyDetails', {
            description:
                'GET request to get the full details of a single property',
            value: `${api.url}properties/{country}/{city}/{street}/{number}`,
        });

        new CfnOutput(this, 'ApiPropertyApproval', {
            description: 'POST request to add a property to the database',
            value: `${api.url}request_approval`,
        });

        // SQS OUTPUTS
        new CfnOutput(this, 'IngestQueueUrl', {
            description: 'URL for the Ingest SQS Queue',
            value: ingestQueue.queueUrl,
        });

        // DYNAMODB OUTPUTS
        new CfnOutput(this, 'WebTableName', {
            value: table.tableName,
            description: 'DynamoDB table storing property information',
        });

        // LAMBDA FUNCTIONS OUTPUTS
        new CfnOutput(this, 'searchFunctionName', {
            value: searchFunction.functionName,
        });
        new CfnOutput(this, 'searchFunctionArn', {
            value: searchFunction.functionArn,
        });

        new CfnOutput(this, 'PublicationApprovedEventHandlerFunctionName', {
            value: publicationApprovedEventHandlerFunction.functionName,
        });
        new CfnOutput(this, 'PublicationApprovedEventHandlerFunctionArn', {
            value: publicationApprovedEventHandlerFunction.functionArn,
        });

        // EVENT BRIDGE OUTPUTS
        new CfnOutput(this, 'UnicornWebEventBusName', {
            value: this.eventBus.eventBusName,
        });

        // CLOUDWATCH LOGS OUTPUTS
        new CfnOutput(this, 'UnicornWebCatchAllLogGroupName', {
            value: catchAllLogGroup.logGroupName,
            description: "Log all events on the service's EventBridge Bus",
        });

        new CfnOutput(this, 'UnicornWebCatchAllLogGroupArn', {
            value: catchAllLogGroup.logGroupArn,
            description: "Log all events on the service's EventBridge Bus",
        });
    }
}
