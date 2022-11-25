// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult, AttributeValue, Context } from 'aws-lambda';
import { LambdaInterface } from '@aws-lambda-powertools/commons';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { DynamoDBClient, GetItemCommand, GetItemCommandInput, QueryCommandInput, Condition, QueryCommand, QueryCommandOutput, UpdateItemCommandInput, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput, PutEventsCommandOutput, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

// Empty configuration for EventBridge
const eventsClient = new EventBridgeClient({});
const EVENT_BUS = process.env.EVENT_BUS;

// Set up the globals
const SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "property_web";
const SERVICE_NAME = process.env.POWERTOOLS_SERVICE_NAME ?? "requestApproval";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "INFO";

const metrics = new Metrics({ namespace: SERVICE_NAMESPACE, serviceName: SERVICE_NAME });
const logger = new Logger({ logLevel: LOG_LEVEL, serviceName: SERVICE_NAME });
const tracer = new Tracer({ serviceName: SERVICE_NAME });

const PROJECTION_PROPERTIES = "country, city, street, contract, #num, description, listprice, currency, #status, images";

type PropertyDBType = {
    PK: string, 
    SK: string,
    country: string,
    city: string, 
    street: string, 
    contract?: string, 
    number: string,
    description: string,
    listprice?: number,
    currency: string,
    status: string,
    images?: string[]
}

class RequestApprovalFunction implements LambdaInterface {
    /**
     * Request approval for a particular property
     * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
     * @param {Object} event - API Gateway Lambda Proxy Input Format
     *
     * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
     * @returns {Object} object - API Gateway Lambda Proxy Output Format
     *
     */
     @tracer.captureLambdaHandler()
     @metrics.logMetrics()
     @logger.injectLambdaContext({ logEvent: true })
    public async handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
        // Inspect request path. 
        logger.info(`Handling request for ${event.resource}`);
        if (event.resource == "/request_approval") {
            return await this.requestApproval(event, context);
        } else {        
            return {
                statusCode: 400,
                body: JSON.stringify({message: `Unable to handle resource ${event.resource}`})
            }    
        }
    }

    /**
     * Request approval for a particular property
     * @param event The request event
     * @param context The Lambda context
     * @returns 
     */
    @tracer.captureMethod()
    private async requestApproval(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

        // Parse the body. 
        const data = event.body ? JSON.parse(event.body) : undefined;
        // Note the propertyId
        const propertyId: string = data['property_id'];
        let PK, SK: string;

        logger.info(`Requesting approval for property ${propertyId}`);

        try {
            // Form the PK and SK from the property id.
            const components: string[] = propertyId.split('/');
            if (components.length < 4) {
                throw new Error(`Invalid propertyId ${propertyId}`);
            }
            const country = components[0];
            const city = components[1];
            const street = components[2];
            const number = components[3];

            const pkDetails = `${country}#${city}`.replace(' ', '-').toLowerCase();
            PK = `PROPERTY#${pkDetails}`;
            SK = `${street}#${number}`.replace(' ', '-').toLowerCase();
        } catch (error: any) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error(`Error during parameter setup: ${JSON.stringify(error)}`);
            return {
                statusCode: 400,
                body: JSON.stringify({error: `Invalid arguments ${JSON.stringify(error)}`})
            };
        }

        logger.info(`Looking for property with PK ${PK} and SK ${SK}`);

        try {
            const property: PropertyDBType = await this.getPropertyFor(PK, SK);

            // If property is already being approved or approved already
            if (property.status in ['APPROVED', 'DEClINED', 'PENDING']) {
                logger.info(`Property already in status ${property.status}; no action taken`);
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: `Property already in status ${property.status}; no action taken`})
                };
            }
    
            logger.info(`Requesting property approval for ${propertyId}`);
    
            const eventDetail = {
                property_id: propertyId,
                address: {
                    country: property.country,
                    city: property.city,
                    street: property.street,
                    number: property.number
                },
                status: 'PENDING',
                listprice: property.listprice,
                images: property.images,
                description: property.description
            };    

            await this.firePropertyEvent(eventDetail, 'unicorn.web');
            await this.updatePropertyFor(PK, SK, 'PENDING');

            return {
                statusCode: 200,
                body: JSON.stringify({message: `Property approval sent for ${propertyId}`})
            };
        } catch (error: any) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error(`Error during property approval request: ${JSON.stringify(error)}`);
            return {
                statusCode: 400,
                body: JSON.stringify({error: JSON.stringify(error)})
            };
        }
    }

    /** 
     * Update property with new status. 
     * @param PK PK attribute
     * @param SK SK attribute
     * @param status status value
     * @returns 
     */
    @tracer.captureMethod()
    private async updatePropertyFor(PK: string, SK: string, status: string): Promise<void> {
        const updateItemCommandInput: UpdateItemCommandInput = {
            Key: {'PK': {S: PK}, 'SK': {S: SK}},
            AttributeUpdates: {'status': {Value: {S: status}, Action: 'PUT'}},
            TableName: DDB_TABLE
        };
    
        const data = await ddbClient.send(new UpdateItemCommand(updateItemCommandInput));
        if (data.$metadata.httpStatusCode !== 200) {
            throw new Error(`Unable to update status for property PK ${PK} and SK ${SK}`);
        } else {
            logger.info(`Updated status for property PK ${PK} and SK ${SK}`);
        }
    }

    /**
     * Retrieve a single property
     * @param PK PK attribute
     * @param SK SK attribute
     * @returns 
     */
    private async getPropertyFor(PK: string, SK: string): Promise<PropertyDBType> {
        const getItemCommandInput: GetItemCommandInput = {
            Key: {'PK': {S: PK}, 'SK': {S: SK}},
            ProjectionExpression: PROJECTION_PROPERTIES,
            ExpressionAttributeNames: {'#num': 'number', '#status': 'status'},
            TableName: DDB_TABLE
        };
    
        const data = await ddbClient.send(new GetItemCommand(getItemCommandInput));
        if (data.Item === undefined) {
            throw new Error(`No item found for PK ${PK} and SK ${SK}`);
        } else {
            const result: PropertyDBType = (unmarshall(data.Item) as PropertyDBType);
            return result;
        }
    }

    /**
     * Fire property approval request event.
     * @param eventDetail 
     * @param source 
     */
    private async firePropertyEvent(eventDetail: any, source: string): Promise<void> {
        const propertyId = eventDetail.property_id;
    
        // Build the Command objects
        const eventsPutEventsCommandInputEntry: PutEventsRequestEntry = {
            EventBusName: EVENT_BUS,
            Time: new Date(),
            Source: source,
            DetailType: 'PublicationApprovalRequested',
            Detail: JSON.stringify(eventDetail)
        };
        const eventsPutEventsCommandInput: PutEventsCommandInput = {
            Entries: [
                eventsPutEventsCommandInputEntry
            ]
        };
        const eventsPutEventsCommand = new PutEventsCommand(eventsPutEventsCommandInput);
    
        // Send the command
        const eventsPutEventsCommandOutput: PutEventsCommandOutput = await eventsClient.send(eventsPutEventsCommand);
    
        if (eventsPutEventsCommandOutput.$metadata.httpStatusCode != 200) {
            let error: Error = {
                name: "PropertyApprovalError",
                message: `EventBridge Response invalid for ${propertyId}: ${eventsPutEventsCommandOutput.$metadata.httpStatusCode}`,
            };
            throw error;    
        }
        logger.info(`Published approval request for ${propertyId}`);
    }
    
}

export const myFunction = new RequestApprovalFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
