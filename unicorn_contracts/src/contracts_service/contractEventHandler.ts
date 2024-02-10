// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ContractDBType, ContractStatusEnum, ContractError } from "./Contract";
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  PutItemCommandInput,
  PutItemCommandOutput,
  PutItemCommand,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

class ContractEventHandlerFunction implements LambdaInterface {
  /**
   * Handles the SQS event and processes each record.
   *
   * @public
   * @async
   * @method handler
   * @param {SQSEvent} event - The SQS event containing the records to process.
   * @param {Context} context - The AWS Lambda context.
   * @returns {Promise<void>} - A promise that resolves when all records have been processed.
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({
    captureColdStartMetric: true,
    throwOnEmptyMetrics: false,
  })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(event: SQSEvent, context: Context): Promise<void> {
    // Parse SQS records
    for (const sqsRecord of event.Records) {
      const contract = this.parseRecord(sqsRecord);
      tracer.putMetadata("Contract", contract);
      switch (sqsRecord.messageAttributes.HttpMethod.stringValue) {
        case "POST":
          logger.info("Creating a contract", { contract });
          try {
            // Save the entry.
            await this.createContract(contract);
          } catch (error) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error("Error during DDB PUT", error as Error);
            throw error;
          }
          break;
        case "PUT":
          logger.info("Updating a contract", { contract });
          try {
            // Update the entry.
            await this.updateContract(contract);
          } catch (error) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error("Error during DDB UPDATE", error as Error);
            throw error;
          }
          break;
        default:
          tracer.addErrorAsMetadata(Error("Request not supported"));
          logger.error("Error request not supported");
      }
    }
  }

  /**
   * Creates a new contract in the database.
   *
   * @private
   * @async
   * @method createContract
   * @param {ContractDBType} contract - The contract to be created.
   * @returns {Promise<void>} - A promise that resolves when the contract is created.
   * @throws {ContractError} - If there is an error during the creation process.
   */
  @tracer.captureMethod()
  private async createContract(contract: ContractDBType): Promise<void> {
    // Construct the DDB Table record
    logger.info("Constructing DB Entry from contract", { contract });
    const createDate = new Date();
    const contractId = randomUUID();
    const dbEntry: ContractDBType = {
      property_id: contract["property_id"],
      contract_created: createDate.toISOString(),
      contract_last_modified_on: createDate.toISOString(),
      contract_id: contractId,
      address: contract["address"],
      seller_name: contract["seller_name"],
      contract_status: ContractStatusEnum.DRAFT,
    };

    // Insert record into DDB
    logger.info("Record to insert", { dbEntry });
    // Build the Command objects
    const ddbPutCommandInput: PutItemCommandInput = {
      TableName: DDB_TABLE,
      Item: marshall(dbEntry, { removeUndefinedValues: true }),
      ConditionExpression:
        "attribute_not_exists(property_id) OR attribute_exists(contract_status) AND contract_status IN (:CANCELLED, :CLOSED, :EXPIRED)",
      ExpressionAttributeValues: {
        ":CANCELLED": { S: ContractStatusEnum.CANCELLED },
        ":CLOSED": { S: ContractStatusEnum.CLOSED },
        ":EXPIRED": { S: ContractStatusEnum.EXPIRED },
      },
    };
    const ddbPutCommand = new PutItemCommand(ddbPutCommandInput);

    // Send the command
    const ddbPutCommandOutput: PutItemCommandOutput = await ddbClient.send(
      ddbPutCommand
    );
    if (ddbPutCommandOutput.$metadata.httpStatusCode != 200) {
      const error: ContractError = {
        propertyId: dbEntry.property_id,
        name: "ContractDBSaveError",
        message:
          "Response error code: " +
          ddbPutCommandOutput.$metadata.httpStatusCode,
        object: ddbPutCommandOutput.$metadata,
      };
      throw error;
    }

    tracer.putAnnotation("ContractStatus", dbEntry.contract_status);

    logger.info("Inserted record for contract", {
      contractId,
      metadata: ddbPutCommandOutput.$metadata,
    });
    metrics.addMetric("ContractCreated", MetricUnits.Count, 1);
  }

  /**
   * Updates a contract in the database.
   *
   * @private
   * @async
   * @method updateContract
   * @param {ContractDBType} contract - The contract to be updated.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  @tracer.captureMethod()
  private async updateContract(contract: ContractDBType): Promise<void> {
    const modifiedDate = new Date();
    const dbEntry: ContractDBType = {
      contract_id: contract.contract_id,
      property_id: contract.property_id,
      contract_status: ContractStatusEnum.APPROVED,
      contract_last_modified_on: modifiedDate.toISOString(),
    };

    logger.info("Record to update", { dbEntry });
    const ddbUpdateCommandInput: UpdateItemCommandInput = {
      TableName: DDB_TABLE,
      Key: { property_id: { S: dbEntry.property_id } },
      UpdateExpression: "set contract_status = :t, modified_date = :m",
      ConditionExpression:
        "attribute_exists(property_id) AND contract_status = :DRAFT",
      ExpressionAttributeValues: {
        ":t": { S: dbEntry.contract_status as string },
        ":m": { S: dbEntry.contract_last_modified_on as string },
        ":DRAFT": { S: ContractStatusEnum.DRAFT },
      },
      ReturnValues: ReturnValue.ALL_NEW,
    };

    const ddbUpdateCommand = new UpdateItemCommand(ddbUpdateCommandInput);

    // Send the command
    const ddbUpdateCommandOutput: UpdateItemCommandOutput =
      await ddbClient.send(ddbUpdateCommand);
    if (ddbUpdateCommandOutput.$metadata.httpStatusCode != 200) {
      const error: ContractError = {
        propertyId: dbEntry.property_id,
        name: "ContractDBUpdateError",
        message:
          "Response error code: " +
          ddbUpdateCommandOutput.$metadata.httpStatusCode,
        object: ddbUpdateCommandOutput.$metadata,
      };
      throw error;
    }

    tracer.putAnnotation(
      "ContractStatus",
      ddbUpdateCommandOutput?.Attributes?.contract_id?.S ?? "undefined"
    );

    logger.info("Updated record for contract", {
      contractId: ddbUpdateCommandOutput?.Attributes?.contract_id?.S,
      metdata: ddbUpdateCommandOutput.$metadata,
    });
    metrics.addMetric("ContractUpdated", MetricUnits.Count, 1);
  }

  /**
   * Parses an SQS record into ContractDBType
   *
   * @private
   * @method validateRecord
   * @param {SQSRecord} record - The SQS record containing the contract.
   * @returns {ContractDBType} - The contract from the SQS record
   */
  private parseRecord(record: SQSRecord): ContractDBType {
    let contract: ContractDBType;
    try {
      contract = JSON.parse(record.body);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error parsing SQS Record", error as Error);
      throw new Error("Error parsing SQS Record");
    }
    logger.info("Returning contract", { contract });
    return contract;
  }
}

export const myFunction = new ContractEventHandlerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
