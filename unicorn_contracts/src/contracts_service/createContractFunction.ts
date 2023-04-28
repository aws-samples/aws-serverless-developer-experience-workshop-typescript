// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { randomUUID } from "crypto";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  ContractEventMetric,
  ContractCreatedMetric,
  validData,
  saveEntryToDB,
  fireContractEvent,
  ContractDBType,
  ContractStatusChangedEvent,
  ContractStatusEnum,
} from "./contractUtils";

const SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "test_namespace";

class CreateContractFunction implements LambdaInterface {
  /**
   * Handle the contract creation.
   * @param {Object} event - API Gateway Lambda Proxy Input Format
   * @returns {Object} object - API Gateway Lambda Proxy Output Format
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    const contractId = randomUUID();
    const createDate = new Date();

    // Assemble from payload
    let data;
    try {
      data = this.validateEvent(event);
    } catch (error) {
      logger.error("Error during request validation", error as Error);
      tracer.addErrorAsMetadata(error as Error);

      return {
        statusCode: 400,
        body: JSON.stringify({ message: (error as Error).message }),
      };
    }

    // Construct the DDB Table record
    logger.info("Constructing DB Entry from data", { data });
    const dbEntry: ContractDBType = {
      property_id: data["property_id"],
      contract_created: createDate.toISOString(),
      contract_last_modified_on: createDate.toISOString(),
      contract_id: contractId,
      address: data["address"],
      seller_name: data["seller_name"],
      contract_status: ContractStatusEnum.DRAFT,
    };

    try {
      // Save the entry.
      await this.createContract(dbEntry, contractId);
      tracer.putMetadata("ContractStatus", dbEntry);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error during DDB PUT", error as Error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Unable to create contract ${contractId}`,
        }),
      };
    }

    // Fire off an event for 'Contract created'
    const contractStatusChanged: ContractStatusChangedEvent = {
      contract_id: contractId,
      contract_last_modified_on: dbEntry.contract_created ?? "",
      contract_status: dbEntry.contract_status,
      property_id: dbEntry.property_id ?? "",
    };

    try {
      await this.publishEvent(contractStatusChanged, contractId);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error during EventBridge PUT:", error as Error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Unable to fire 'Contract created' event for contract ${contractId}`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(contractStatusChanged),
    };
  }

  /**
   * Send an EventEngine event flagging the contract status has changed.
   * @param contractStatusChanged
   * @param contractId
   */
  @tracer.captureMethod()
  private async publishEvent(
    contractStatusChanged: ContractStatusChangedEvent,
    contractId: string
  ): Promise<void> {
    const response = await fireContractEvent(
      contractStatusChanged,
      SERVICE_NAMESPACE,
      "ContractStatusChanged"
    );
    logger.info("Fired event for contract", {
      contractId,
      metadata: response.metadata,
    });
    metrics.addMetric(ContractEventMetric, MetricUnits.Count, 1);
  }

  /**
   * Save the entry to the database
   * @param dbEntry
   * @param contractId
   */
  @tracer.captureMethod()
  private async createContract(
    dbEntry: ContractDBType,
    contractId: string
  ): Promise<void> {
    logger.info("Record to insert", { dbEntry });
    const response = await saveEntryToDB(dbEntry);
    logger.info("Inserted record for contract", {
      contractId,
      metadata: response.metadata,
    });
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
    logger.info("Returning data", { data });
    return data;
  }
}

export const myFunction = new CreateContractFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
