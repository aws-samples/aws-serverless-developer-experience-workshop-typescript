// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";

export type StepFunctionsResponse = {
  statusCode: number;
  validation_result?: string;
  error?: string;
};

class ContentIntegrityValidatorFunction {
  /**
   * Handle the validation of content integrity.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {StepFunctionsResponse}
   *
   */
  public async handler(
    event: any,
    context: Context
  ): Promise<StepFunctionsResponse> {
    console.log(`Step Function event triggered ${JSON.stringify(event)}`);
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
            console.log(`Found offensive image at index ${i}`);
            return { statusCode: 200, validation_result: "FAIL" };
          }
        }
        console.log(`No offensive images found.`);
        return { statusCode: 200, validation_result: "PASS" };
      } else {
        console.log(`Found offensive description`);
        return { statusCode: 200, validation_result: "FAIL" };
      }
    } catch (error: any) {
      console.log(
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
