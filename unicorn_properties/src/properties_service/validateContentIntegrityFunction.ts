// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from 'aws-lambda';
import { LambdaInterface } from '@aws-lambda-powertools/commons';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';

// Set up the globals
const SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "unicorn.properties";
const SERVICE_NAME = process.env.SERVICE_NAME ?? "validateContentIntegrity";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "INFO";

const metrics = new Metrics({ namespace: SERVICE_NAMESPACE, serviceName: SERVICE_NAME });
const logger = new Logger({ logLevel: LOG_LEVEL, serviceName: SERVICE_NAME });
const tracer = new Tracer({ serviceName: SERVICE_NAME });

export type StepFunctionsResponse = {
    statusCode: number;
    validation_result?: string;
    error?: string;
}

class ValidateContentIntegrityFunction implements LambdaInterface {

    /**
     * Handle the validation of content integrity.
     * @param {Object} event - EventBridge Event Input Format
     * @returns {StepFunctionsResponse} 
     *
     */
     @tracer.captureLambdaHandler()
     @metrics.logMetrics()
     @logger.injectLambdaContext()
    public async handler(event: any, context: Context): Promise<StepFunctionsResponse> {
        logger.info(`Step Function event triggered ${JSON.stringify(event)}`);
        try {
            // Get the task token and contract id from the input 
            let input = event;
            // Check the content sentiment. 
            if (input.contentSentiment.Sentiment === "POSITIVE") {
                // Check the imageModerations 
                const imageModerations = input.imageModerations;
                for (let i = 0; i < imageModerations.length; i++) {
                    const moderation = imageModerations[i];
                    if (moderation.ModerationLabels?.length > 0) {
                        logger.warn(`Found offensive image at index ${i}`);
                        return { statusCode: 200, validation_result: "FAIL"};
                    }
                }
                logger.warn(`No offensive images found.`);
                return { statusCode: 200, validation_result: "PASS"};
            } else {
                logger.warn(`Found offensive description`);
                return { statusCode: 200, validation_result: "FAIL"};
            }
        } catch (error: any) {
            tracer.addErrorAsMetadata(error as Error);        
            logger.error(`Error during Validation of Content Integrity: ${JSON.stringify(error)}`);
            return {
                statusCode: 500,
                error: JSON.stringify(error)
            }
        }
    }
}

export const myFunction = new ValidateContentIntegrityFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);