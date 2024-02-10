// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";

export type StepFunctionsResponse = {
  statusCode: number;
  validation_result?: string;
  error?: string;
};

class ContentIntegrityValidatorFunction implements LambdaInterface {
  /**
   * Handle the validation of content integrity.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {StepFunctionsResponse}
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: any,
    context: Context
  ): Promise<StepFunctionsResponse> {
    logger.info(`Step Function event triggered ${JSON.stringify(event)}`);
    try {
      // Get the task token and contract id from the input
      const input = event;
      // Check the content sentiment.
      if (input.contentSentiment.Sentiment === "POSITIVE") {
        // Check the imageModerations
        const imageModerations = input.imageModerations;
        for (let i = 0; i < imageModerations.length; i++) {
          const moderation = imageModerations[i];
          if (moderation.ModerationLabels?.length > 0) {
            logger.warn(`Found offensive image at index ${i}`);
            return { statusCode: 200, validation_result: "FAIL" };
          }
        }
        logger.warn(`No offensive images found.`);
        return { statusCode: 200, validation_result: "PASS" };
      } else {
        logger.warn(`Found offensive description`);
        return { statusCode: 200, validation_result: "FAIL" };
      }
    } catch (error: any) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(
        `Error during Validation of Content Integrity: ${JSON.stringify(error)}`
      );
      return {
        statusCode: 500,
        error: JSON.stringify(error),
      };
    }
  }
}

export const myFunction = new ContentIntegrityValidatorFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
