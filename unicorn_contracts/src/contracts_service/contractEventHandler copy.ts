// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import { randomUUID } from "crypto";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import { saveEntryToDB, ContractDBType, ContractStatusEnum, updateEntryInDB } from "./contractUtils";

class ContractEventHandlerFunction implements LambdaInterface {
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
    event: SQSEvent,
    context: Context
  ): Promise<void> {
    const contractId = randomUUID();
    const createDate = new Date();

    // Parse SQS records
    event.Records.map((sqs_record) => {
      const method = sqs_record.body.method;
      switch (method) {
        case "PUT":
          try {
            // Save the entry.
            this.createContract(sqs_record, contractId);
            tracer.putMetadata("ContractStatus", sqs_record);
          } catch (error) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error("Error during DDB PUT", error as Error);
            return;
          }
          break;
        case "POST":
          try {
            this.updateContract(sqs_record, contractId);
          } catch (error) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error("Error during EventBridge PUT:", error as Error);
            return;
          }
          break;
        default:
          tracer.addErrorAsMetadata(Error("Request not supported"));
          logger.error("Error request not supported");
      }


    })

    return;
  }

  /**
   * Update entry to the database
   * @param dbEntry
   * @param contractId
   */
  @tracer.captureMethod()
  private async updateContract(
    sqs_record: SQSRecord,
    contractId: string
  ): Promise<void> {

    const data = JSON.parse(sqs_record.body);
    // Check for an existing record.
    const existingContract = await this.getExistingContract(data.propertyId);
    if (existingContract === undefined) {
      logger.error("No contract found for specified Property ID", { data.propertyId });
      tracer.getSegment()?.addErrorFlag();
      return;
    }

    // Construct the DDB Table record
    logger.info("Constructing DB Entry from data", { data });
    let dbEntry: ContractDBType = {
      contract_id: existingContract.contract_id,
      property_id: data.propertyId,
      contract_status: ContractStatusEnum.APPROVED,
      contract_last_modified_on: new Date().toISOString(),
    };
    logger.info("Record to update", { dbEntry });
    const response = await updateEntryInDB(dbEntry);
    logger.info("Updated record for contract", {
      contractId: dbEntry.contract_id,
      metdata: response.metadata,
    });
  }

  /**
   * save 
   * @param dbEntry
   * @param contractId
   */
  @tracer.captureMethod()
  private async createContract(
    sqs_record: SQSRecord,
    contractId: string
  ): Promise<void> {
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
  private validateEvent(event: SQSEvent) {
    /* TODO - Kevin */
    const data = event.Records.map(record => record);
    return data;
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
}

export const myFunction = new ContractEventHandlerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
