// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { randomUUID } from "crypto";
import { LambdaInterface } from '@aws-lambda-powertools/commons';
import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { 
    ContractEventMetric, 
    ContractCreatedMetric, 
    validData, 
    saveEntryToDB, 
    fireContractEvent, 
    ContractDBType, 
    ContractStatusChangedEvent,
    ContractStatusEnum} from './contractUtils';

// Set up the globals
const SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "test_namespace";
const SERVICE_NAME = process.env.POWERTOOLS_SERVICE_NAME ?? "createContract";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "INFO";

const metrics = new Metrics({ namespace: SERVICE_NAMESPACE, serviceName: SERVICE_NAME });
const logger = new Logger({ logLevel: LOG_LEVEL, serviceName: SERVICE_NAME });
const tracer = new Tracer({ serviceName: SERVICE_NAME });

class CreateContractFunction implements LambdaInterface {
    /**
     * Handle the contract creation.
     * @param {Object} event - API Gateway Lambda Proxy Input Format
     * @returns {Object} object - API Gateway Lambda Proxy Output Format
     *
     */
     @tracer.captureLambdaHandler()
     @metrics.logMetrics()
     @logger.injectLambdaContext({ logEvent: true })
    public async handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

        const contractId = randomUUID();
        const createDate = new Date();

        try {
            // Assemble from payload
            let data;
            try {
                data = this.validateEvent(event);

            } catch (error: any) {
                logger.error(error);
                const response: APIGatewayProxyResult = {
                    statusCode: 400,
                    body: JSON.stringify({message: (error as Error).message})
                };
                tracer.addErrorAsMetadata(error);
                tracer.addResponseAsMetadata(response, process.env._HANDLER);
                return response;
            }

            // Construct the DDB Table record 
            logger.info(`Constructing DB Entry from ${JSON.stringify(data)}`);
            const dbEntry: ContractDBType = {
                property_id: data['property_id'],
                contract_created: createDate.toISOString(),
                contract_last_modified_on: createDate.toISOString(),
                contract_id: contractId,
                address: data['address'],
                seller_name: data['seller_name'],
                contract_status: ContractStatusEnum.DRAFT
            };

            try {
                // Save the entry.
                await this.createContract(dbEntry, contractId);
                tracer.putAnnotation('ContractStatus', JSON.stringify(dbEntry));
            } catch (error: any) {
                tracer.addErrorAsMetadata(error as Error);
                logger.error(`Error during DDB PUT: ${JSON.stringify(error)}`);
                return {
                    statusCode: 500,
                    body: JSON.stringify({error: `Unable to create contract ${contractId}`})
                };
            }

            // Fire off an event for 'Contract created' 
            const contractStatusChanged: ContractStatusChangedEvent = {
                'contract_id': contractId,
                'contract_last_modified_on': dbEntry.contract_created?? '',
                'contract_status': dbEntry.contract_status,
                'property_id': dbEntry.property_id?? ''
            };

            try {
                await this.publishEvent(contractStatusChanged, contractId);
            } catch (error: any) {
                tracer.addErrorAsMetadata(error as Error);
                logger.error(`Error during EventBridge PUT: ${JSON.stringify(error)}`);
                return {
                    statusCode: 500,
                    body: JSON.stringify({error: `Unable to fire 'Contract created' event for contract ${contractId}`})
                };
            }

            const apiResponse: APIGatewayProxyResult = {
                statusCode: 200,
                body: JSON.stringify(contractStatusChanged)
            };
            tracer.addResponseAsMetadata(apiResponse, process.env._HANDLER);
            return apiResponse;
        } finally {
            // Don't forget to publish your metrics.
            metrics.publishStoredMetrics();
        }
    }

    /**
     * Send an EventEngine event flagging the contract status has changed. 
     * @param contractStatusChanged 
     * @param contractId 
     */
     @tracer.captureMethod()
    private async publishEvent(contractStatusChanged: ContractStatusChangedEvent, contractId: string): Promise<void> {
        const response = await fireContractEvent(contractStatusChanged, SERVICE_NAMESPACE, 'ContractStatusChanged');
        logger.info(`Fired event for contract ${contractId}  Metdata: ${JSON.stringify(response.metadata)}`);
        metrics.addMetric(ContractEventMetric, MetricUnits.Count, 1);
    }

    /**
     * Save the entry to the database
     * @param dbEntry 
     * @param contractId 
     */
     @tracer.captureMethod()
    private async createContract(dbEntry: ContractDBType, contractId: string): Promise<void> {
        logger.info(`Record to insert: ${JSON.stringify(dbEntry)}`);
        const response = await saveEntryToDB(dbEntry);
        logger.info(`Inserted record for contract: ${contractId} Metdata: ${JSON.stringify(response.metadata)}`);
        metrics.addMetric(ContractCreatedMetric, MetricUnits.Count, 1);
    }

    /**
     * Parse and validate the data coming in from the API Gateway event.
     * @param data 
     * @param event 
     * @returns 
     */    
    private validateEvent(event: APIGatewayProxyEvent) {
        const data = event.body ? JSON.parse(event.body) : undefined;

        // Validate and verify payload.
        if (data === undefined || !validData(data)) {
            // No body passed - bad request
            throw new Error("Must specify contract details");
        }
        logger.info(`Returning ${JSON.stringify(data)}`);
        return data;
    }
}

export const myFunction = new CreateContractFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);