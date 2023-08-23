// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  ContractUpdatedMetric,
  ContractEventMetric,
  fireContractEvent,
  ContractDBType,
  updateEntryInDB,
  ContractStatusEnum,
  ContractStatusChangedEvent,
  getContractFor,
} from "./contractUtils";

const SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "test_namespace";

class UpdateContractFunction implements LambdaInterface {
  /**
   * Handle contract updates
   * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
   * @param {Object} event - API Gateway Lambda Proxy Input Format
   *
   * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
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
    const modifiedDate = new Date();

    // Assemble from payload
    let data;
    try {
      data = await this.validateEvent(event);
    } catch (error) {
      logger.error("Error during request validation", error as Error);
      tracer.addErrorAsMetadata(error as Error);

      return {
        statusCode: 400,
        body: JSON.stringify({ message: (error as Error).message }),
      };
    }

    const propertyId = data["property_id"];
    tracer.putAnnotation("propertyId", propertyId);

    // Check for an existing record.
    const existingContract = await this.getExistingContract(propertyId);
    if (existingContract === undefined) {
      logger.error("No contract found for specified Property ID", {
        propertyId,
      });
      tracer.getSegment()?.addErrorFlag();

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `No contract found for specified Property ID`,
        }),
      };
    } // else the contract exists so just update it.

    // Construct the DDB Table record
    const dbEntry: ContractDBType = {
      contract_id: existingContract.contract_id,
      property_id: propertyId,
      contract_status: ContractStatusEnum.APPROVED,
      contract_last_modified_on: modifiedDate.toISOString(),
    };

    try {
      await this.updateContract(dbEntry);
      tracer.putMetadata("ContractStatus", dbEntry);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error during DDB UPDATE", error as Error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Unable to update contract for property ${propertyId}`,
        }),
      };
    }

    // Fire off an event for 'Contract created'
    const contractStatusChanged: ContractStatusChangedEvent = {
      contract_id: dbEntry.contract_id ?? "",
      contract_last_modified_on: dbEntry.contract_last_modified_on ?? "",
      contract_status: dbEntry.contract_status,
      property_id: dbEntry.property_id ?? "",
    };
    try {
      await this.publishEvent(contractStatusChanged);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error during EventBridge PUT", error as Error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Unable to fire 'Contract updated' event for contract for property ${propertyId}`,
        }),
      };
    }

    // All ended well
    return {
      statusCode: 200,
      body: JSON.stringify(dbEntry),
    };
  }

  /**
   * Get the ContractStatus for this propertyId
   * @param propertyId
   * @returns
   */
  @tracer.captureMethod()
  private async getExistingContract(
    propertyId: string
  ): Promise<ContractDBType | undefined> {
    logger.info("Record to be retrieved", { propertyId });
    const response = await getContractFor(propertyId);
    logger.info("Retrieved", { response });
    return response;
  }

  /**
   * Send an EventEngine event flagging the contract status has changed.
   * @param contractStatusChanged
   * @param contractId
   */
  @tracer.captureMethod()
  private async publishEvent(
    contractStatusChanged: ContractStatusChangedEvent
  ) {
    const response = await fireContractEvent(
      contractStatusChanged,
      SERVICE_NAMESPACE,
      "ContractStatusChanged"
    );
    logger.info("Fired event for contract for property", {
      propertyId: contractStatusChanged.property_id,
      metdata: response.metadata,
    });
    metrics.addMetric(ContractEventMetric, MetricUnits.Count, 1);
  }

  /**
   * Update the entry in the DB
   * @param dbEntry
   */
  @tracer.captureMethod()
  private async updateContract(dbEntry: ContractDBType): Promise<void> {
    logger.info("Record to update", { dbEntry });
    const response = await updateEntryInDB(dbEntry);
    logger.info("Updated record for contract", {
      contractId: dbEntry.contract_id,
      metdata: response.metadata,
    });
    metrics.addMetric(ContractUpdatedMetric, MetricUnits.Count, 1);
  }

  /**
   * Parse and validate the data coming in from the API Gateway event.
   * @param data
   * @param event
   * @returns
   */
  private validateEvent(event: APIGatewayProxyEvent) {
    const data = event.body ? JSON.parse(event.body) : undefined;

    if (data === undefined) {
      // No body passed - bad request
      throw new Error("Must specify contract details");
    }

    // Different set of fields for validation for update.
    const fields: string[] = ["property_id"];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!(field in data)) {
        throw new Error("Must specify property id");
      }
    }
    return data;
  }
}

export const myFunction = new UpdateContractFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
