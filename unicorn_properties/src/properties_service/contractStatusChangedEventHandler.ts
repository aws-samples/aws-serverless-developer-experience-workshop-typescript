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
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { ContractStatusChanged } from "../schema/unicorn_contracts/contractstatuschanged/ContractStatusChanged";
import { Marshaller } from "../schema/unicorn_contracts/contractstatuschanged/marshaller/Marshaller";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.CONTRACT_STATUS_TABLE ?? "ContractStatusTable";

export interface ContractStatusError extends Error {
  contract_id: string;
  name: string;
  object: any;
}

class ContractStatusChangedFunction implements LambdaInterface {
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
    event: EventBridgeEvent<string, ContractStatusChanged>,
    context: Context
  ): Promise<void> {
    logger.info(`Contract status changed: ${JSON.stringify(event.detail)}`);
    try {
      // Construct the entry to insert into database.
      const statusEntry: ContractStatusChanged = Marshaller.unmarshal(
        event.detail,
        "ContractStatusChanged"
      );
      tracer.putAnnotation("ContractStatus", statusEntry.contractStatus);
      logger.info(`Unmarshalled entry: ${JSON.stringify(statusEntry)}`);

      // Build the Command objects
      await this.saveContractStatus(statusEntry);
    } catch (error: any) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(`Error during DDB UPDATE: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Update the ContractStatus entry in the database
   * @param statusEntry
   */
  @tracer.captureMethod()
  private async saveContractStatus(statusEntry: ContractStatusChanged) {
    logger.info(
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
    logger.info(`Constructed command ${JSON.stringify(ddbUpdateCommandInput)}`);
    const ddbUpdateCommand = new UpdateItemCommand(ddbUpdateCommandInput);

    // Send the command
    const ddbUpdateCommandOutput: UpdateItemCommandOutput =
      await ddbClient.send(ddbUpdateCommand);
    logger.info(
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
