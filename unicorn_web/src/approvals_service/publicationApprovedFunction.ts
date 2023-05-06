// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { EventBridgeEvent, Context } from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { PublicationEvaluationCompleted } from "../schema/unicorn_properties/publicationevaluationcompleted/PublicationEvaluationCompleted";
import { Marshaller } from "../schema/unicorn_properties/publicationevaluationcompleted/marshaller/Marshaller";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

class PublicationApprovedFunction implements LambdaInterface {
  /**
   * Handle the contract status changed event from the EventBridge instance.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {void}
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: EventBridgeEvent<string, PublicationEvaluationCompleted>,
    context: Context
  ): Promise<void> {
    logger.info(`Property status changed: ${JSON.stringify(event.detail)}`);
    try {
      // Construct the entry to insert into database.
      let propertyEvaluation: PublicationEvaluationCompleted =
        Marshaller.unmarshal(event.detail, "PublicationEvaluationCompleted");

      logger.info(`Unmarshalled entry: ${JSON.stringify(propertyEvaluation)}`);

      // Build the Command objects
      await this.savePropertyStatus(propertyEvaluation);
    } catch (error: any) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(`Error during DDB UPDATE: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Update the Property entry in the database
   * @param propertyEvaluation
   */
  @tracer.captureMethod()
  private async savePropertyStatus(
    propertyEvaluation: PublicationEvaluationCompleted
  ) {
    logger.info(
      `Updating status: ${propertyEvaluation.evaluationResult} for ${propertyEvaluation.propertyId}`
    );
    const propertyId = propertyEvaluation.propertyId;

    // Form the PK and SK from the property id.
    const components: string[] = propertyId.split("/");
    if (components.length < 4) {
      throw new Error(`Invalid propertyId ${propertyId}`);
    }
    const country = components[0];
    const city = components[1];
    const street = components[3];
    const number = components[4];

    const pkDetails = `${country}#${city}`.replace(" ", "-").toLowerCase();
    const PK = `PROPERTY#${pkDetails}`;
    const SK = `${street}#${number}`.replace(" ", "-").toLowerCase();

    logger.info(
      `Updating database: ${propertyEvaluation.evaluationResult} for ${propertyEvaluation.propertyId}`
    );
    await this.updatePropertyFor(PK, SK, propertyEvaluation.evaluationResult);
    logger.info(
      `Updated database: ${propertyEvaluation.evaluationResult} for ${propertyEvaluation.propertyId}`
    );
  }

  /**
   * Update property with new status.
   * @param PK PK attribute
   * @param SK SK attribute
   * @param status status value
   * @returns
   */
  @tracer.captureMethod()
  private async updatePropertyFor(
    PK: string,
    SK: string,
    status: string
  ): Promise<void> {
    const updateItemCommandInput: UpdateItemCommandInput = {
      Key: { PK: { S: PK }, SK: { S: SK } },
      AttributeUpdates: { status: { Value: { S: status }, Action: "PUT" } },
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(
      new UpdateItemCommand(updateItemCommandInput)
    );
    if (data.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Unable to update status for property PK ${PK} and SK ${SK}`
      );
    } else {
      logger.info(`Updated status for property PK ${PK} and SK ${SK}`);
    }
  }
}

export const myFunction = new PublicationApprovedFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
