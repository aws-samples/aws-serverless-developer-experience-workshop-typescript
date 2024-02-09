// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { EventBridgeEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

// Remove PublicationEvaluationCompleted
type PublicationEvaluationCompleted = {
  evaluationResult: string;
  propertyId: string;
};

class PublicationApprovedFunction {
  /**
   * Handle the contract status changed event from the EventBridge instance.
   * @param {EventBridgeEvent} event - EventBridge Event Input Format
   * @returns {void}
   *
   */
  public async handler(
    event: EventBridgeEvent<string, PublicationEvaluationCompleted>,
    context: Context
  ): Promise<void> {
    console.log(`Property status changed: ${JSON.stringify(event.detail)}`);
    // Construct the entry to insert into database.
    const propertyEvaluation = event.detail;
    try {
      // Call publicationApproved with the entry
    } catch (error: any) {
      console.log(`Error during DDB UPDATE: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Update the Property entry in the database
   * @private
   * @async
   * @method publicationApproved
   * @param {PublicationEvaluationCompleted} event - The EventBridge event when a contract changes
   * @returns {Promise<void>} - A promise that resolves when all records have been processed.
   */
  private async publicationApproved(
    propertyEvaluation: PublicationEvaluationCompleted
  ) {
    console.log(
      `Updating status: ${propertyEvaluation.evaluationResult} for ${propertyEvaluation.propertyId}`
    );
    const propertyId = propertyEvaluation.propertyId;
    const { PK, SK } = this.getDynamoDBKeys(propertyId);
    const updateItemCommandInput: UpdateItemCommandInput = {
      Key: { PK: { S: PK }, SK: { S: SK } },
      AttributeUpdates: { status: { Value: { S: status }, Action: "PUT" } },
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new UpdateItemCommand(updateItemCommandInput));
    if (data.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Unable to update status for property PK ${PK} and SK ${SK}`
      );
    }
    console.log(`Updated status for property PK ${PK} and SK ${SK}`);
  }

  private getDynamoDBKeys(property_id: string) {
    // Form the PK and SK from the property id.
    const components: string[] = property_id.split("/");
    if (components.length < 4) {
      throw new Error(`Invalid propertyId ${property_id}`);
    }
    const country = components[0];
    const city = components[1];
    const street = components[3];
    const number = components[4];

    const pkDetails = `${country}#${city}`.replace(" ", "-").toLowerCase();
    const PK = `PROPERTY#${pkDetails}`;
    const SK = `${street}#${number}`.replace(" ", "-").toLowerCase();

    return { PK, SK }
  }
}

export const myFunction = new PublicationApprovedFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
