// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SFNClient } from "@aws-sdk/client-sfn";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.CONTRACT_STATUS_TABLE ?? "ContractStatusTable";

// Empty configuration for SFN
const sfnClient = new SFNClient({});

export type StepFunctionsResponse = {
  statusCode: number;
  body: string;
};

export type ContractStatus = {
  contract_id: string;
  property_id: string;
  contract_status?: string;
  TaskToken?: string;
};

export class ContractStatusNotFoundException extends Error {
  statusCode: number;

  constructor(
    message?: string | `No contract found for specfieid Property ID`
  ) {
    super(message);
    this.name = "ContractStatusNotFoundException";
    this.statusCode = 400;
  }
}

class ContractExistsCheckerFunction implements LambdaInterface {
  /**
   * Handle the contract existence checking.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {StepFunctionsResponse}
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: any,
    context: Context
  ): Promise<StepFunctionsResponse> {
    logger.info(`Step Function event triggered ${JSON.stringify(event)}`);
    let contractExists = false;
    let currentStatus: ContractStatus | undefined;
    try {
      // Get the task token and contract id from the input
      const detail = event.Input;
      logger.info(`Input: ${JSON.stringify(detail)}`);
      const propertyId = detail.property_id;

      // Look for the contract in the ContractStatusTable and check it's status
      logger.info(`Get contract status for property: ${propertyId}`);
      currentStatus = await this.getContractStatus(propertyId);
      logger.info(`Current status is ${JSON.stringify(currentStatus)}`);

      // No item? No contract?
      if (
        currentStatus === undefined ||
        currentStatus.contract_id === undefined ||
        currentStatus.contract_id === ""
      ) {
        const msg = `Contract not in system yet for ${propertyId}`;
        logger.warn(msg);
        contractExists = false;
      } else {
        contractExists = true;
      }
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(
        `Error during Contract Status Check: ${JSON.stringify(error)}`
      );
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }

    if (!contractExists) throw new ContractStatusNotFoundException();
    else {
      return { statusCode: 200, body: JSON.stringify(currentStatus) };
    }
  }

  /**
   * Get the Contract Status for the propertyId
   * @param propertyId
   * @returns
   */
  @tracer.captureMethod()
  private async getContractStatus(
    propertyId: string
  ): Promise<ContractStatus | undefined> {
    const getItemCommandInput: GetItemCommandInput = {
      Key: { property_id: { S: propertyId } },
      ProjectionExpression: "contract_id, property_id, contract_status",
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new GetItemCommand(getItemCommandInput));
    if (data.Item === undefined) {
      return undefined;
    } else {
      return unmarshall(data.Item) as ContractStatus;
    }
  }
}

export const myFunction = new ContractExistsCheckerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
