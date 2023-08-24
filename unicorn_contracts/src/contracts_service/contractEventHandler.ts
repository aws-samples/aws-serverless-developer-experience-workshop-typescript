// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import { randomUUID } from "crypto";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import { saveEntryToDB, ContractDBType, ContractStatusEnum, updateEntryInDB, getContractFor } from "./contractUtils";

class ContractEventHandlerFunction implements LambdaInterface {
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: SQSEvent,
    context: Context
  ): Promise<void> {
    // Parse SQS records
    event.Records.map((sqs_record: SQSRecord) => {
      const contract = this.validateRecord(sqs_record);
      switch (sqs_record.messageAttributes.HttpMethod.stringValue) {
        case "POST":
          try {
            // Save the entry.
            this.createContract(contract);
            tracer.putMetadata("ContractStatus", contract);
          } catch (error) {
            tracer.addErrorAsMetadata(error as Error);
            logger.error("Error during DDB PUT", error as Error);
            return;
          }
          break;
        case "PUT":
          try {
            this.updateContract(contract);
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


  @tracer.captureMethod()
  private async updateContract(
    contract: ContractDBType): Promise<void> {

    // Check for an existing record.
    const existing_contract = await this.getExistingContract(contract.property_id);
    if (existing_contract === undefined) {
      logger.error(`No contract found for specified Property ID ${contract.property_id}`);
      tracer.getSegment()?.addErrorFlag();
      return;
    }

    // Construct the DDB Table record
    logger.info("Constructing DB Entry from data", { contract });
    let dbEntry: ContractDBType = {
      contract_id: existing_contract.contract_id,
      property_id: contract.property_id,
      contract_status: ContractStatusEnum.APPROVED,
      contract_last_modified_on: new Date().toISOString(),
    };
    logger.info("Record to update", { dbEntry });
    const response = await updateEntryInDB(dbEntry);
    logger.info("Updated record for contract", {
      contractId: dbEntry.contract_id,
      metdata: response.metadata,
    });
    metrics.addMetric("ContractUpdated", MetricUnits.Count, 1);
  }


  @tracer.captureMethod()
  private async createContract(
    contract: ContractDBType,
  ): Promise<void> {
    // Construct the DDB Table record
    logger.info("Constructing DB Entry from contract", { contract });
    const createDate = new Date();
    const contract_id = randomUUID();
    const dbEntry: ContractDBType = {
      property_id: contract["property_id"],
      contract_created: createDate.toISOString(),
      contract_last_modified_on: createDate.toISOString(),
      contract_id: contract_id,
      address: contract["address"],
      seller_name: contract["seller_name"],
      contract_status: ContractStatusEnum.DRAFT,
    };
    logger.info("Record to insert", { dbEntry });
    const response = await saveEntryToDB(dbEntry);
    logger.info("Inserted record for contract", {
      contract_id,
      metadata: response.metadata,
    });
    metrics.addMetric("ContractCreated", MetricUnits.Count, 1);
  }


  private validateRecord(record: SQSRecord): ContractDBType {
    let contract: ContractDBType;
    try {
      contract = JSON.parse(record.body);
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error("Error parsing SQS Record", error as Error);
      throw (new Error("Error parsing SQS Record"));
    }
    logger.info("Returning contract", { contract });
    return contract;
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
    logger.info(`Record to be retrieved", ${propertyId}`);
    const response = await getContractFor(propertyId);
    logger.info("Retrieved", { response });
    return response;
  }
}

export const myFunction = new ContractEventHandlerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
