// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { EventBridgeEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.CONTRACT_STATUS_TABLE ?? "ContractStatusTable";

export interface ContractStatusError extends Error {
  contract_id: string;
  name: string;
  object: any;
}

// Remove ContractStatusChanged type and ContractStatusEnum
type ContractStatusChanged = {
  contractLastModifiedOn: string;
  contractId: string;
  propertyId: string;
  contractStatus: ContractStatusEnum;
};

enum ContractStatusEnum {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED",
}

class ContractStatusChangedFunction {
  /**
   * Handle the contract status changed event from the EventBridge instance.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {void}
   *
   */
  public async handler(
    event: EventBridgeEvent<string, ContractStatusChanged>,
    context: Context
  ): Promise<void> {
    console.log(`Contract status changed: ${JSON.stringify(event.detail)}`);
    // Construct the entry to insert into database.
    let statusEntry: ContractStatusChanged = event.detail;

    try {
      // Call saveContractStatus with the entry
    } catch (error: any) {
      console.log(`Error during DDB UPDATE: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Update the ContractStatus entry in the database
   * @param statusEntry
   */
  private async saveContractStatus(statusEntry: ContractStatusChanged) {
    console.log(
      `Updating status: ${statusEntry.contractStatus} for ${statusEntry.propertyId}`
    );
    const ddbUpdateCommandInput: UpdateItemCommandInput = {
      TableName: DDB_TABLE,
      Key: { property_id: { S: statusEntry.propertyId } },
      UpdateExpression:
        "set contract_id = :c, contract_status = :t, contract_last_modified_on = :m",
      ExpressionAttributeValues: {
        ":c": { S: statusEntry.contractId as string },
        ":t": { S: statusEntry.contractStatus as string },
        ":m": { S: statusEntry.contractLastModifiedOn },
      },
    };
    console.log(`Constructed command ${JSON.stringify(ddbUpdateCommandInput)}`);
    const ddbUpdateCommand = new UpdateItemCommand(ddbUpdateCommandInput);

    // Send the command
    const ddbUpdateCommandOutput: UpdateItemCommandOutput =
      await ddbClient.send(ddbUpdateCommand);
    console.log(
      `Updated status: ${statusEntry.contractStatus} for ${statusEntry.propertyId}`
    );
    if (ddbUpdateCommandOutput.$metadata.httpStatusCode != 200) {
      const error: ContractStatusError = {
        contract_id: statusEntry.contractId,
        name: "ContractStatusDBUpdateError",
        message:
          "Response error code: " +
          ddbUpdateCommandOutput.$metadata.httpStatusCode,
        object: ddbUpdateCommandOutput.$metadata,
      };
      throw error;
    }
  }
}

export const myFunction = new ContractStatusChangedFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
