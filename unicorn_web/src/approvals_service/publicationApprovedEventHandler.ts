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
   * @param {EventBridgeEvent} event - EventBridge Event Input Format
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
    // Construct the entry to insert into database.
    const propertyEvaluation: PublicationEvaluationCompleted =
      Marshaller.unmarshal(event.detail, "PublicationEvaluationCompleted");
    logger.info(`Unmarshalled entry: ${JSON.stringify(propertyEvaluation)}`);

    try {
      await this.publicationApproved(propertyEvaluation);
    } catch (error: any) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(`Error during DDB UPDATE: ${JSON.stringify(error)}`);
    }
    metrics.addMetric("ContractUpdated", MetricUnits.Count, 1);
  }

  /**
   * Update the Property entry in the database
   * @private
   * @async
   * @method publicationApproved
   * @param {PublicationEvaluationCompleted} event - The EventBridge event when a contract changes
   * @returns {Promise<void>} - A promise that resolves when all records have been processed.
   */
  @tracer.captureMethod()
  private async publicationApproved(
    propertyEvaluation: PublicationEvaluationCompleted
  ) {
    tracer.putAnnotation("propertyId", propertyEvaluation.propertyId);
    logger.info(
      `Updating status: ${propertyEvaluation.evaluationResult} for ${propertyEvaluation.propertyId}`
    );
    const propertyId = propertyEvaluation.propertyId;
    const { PK, SK } = this.getDynamoDBKeys(propertyId);
    const updateItemCommandInput: UpdateItemCommandInput = {
      Key: { PK: { S: PK }, SK: { S: SK } },
      ExpressionAttributeNames: {
        "#s": "status",
      },
      ExpressionAttributeValues: {
        ":t": {
          S: propertyEvaluation.evaluationResult,
        },
      },
      UpdateExpression: "SET #s = :t",
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(
      new UpdateItemCommand(updateItemCommandInput)
    );
    if (data.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Unable to update status for property PK ${PK} and SK ${SK}`
      );
    }
    logger.info(`Updated status for property PK ${PK} and SK ${SK}`);
  }

  private getDynamoDBKeys(property_id: string) {
    // Form the PK and SK from the property id.
    const components: string[] = property_id.split("/");
    if (components.length < 4) {
      throw new Error(`Invalid propertyId ${property_id}`);
    }
    const country = components[0];
    const city = components[1];
    const street = components[2];
    const number = components[3];

    const pkDetails = `${country}#${city}`.replace(" ", "-").toLowerCase();
    const PK = `PROPERTY#${pkDetails}`;
    const SK = `${street}#${number}`.replace(" ", "-").toLowerCase();

    return { PK, SK };
  }
}

export const myFunction = new PublicationApprovedFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
