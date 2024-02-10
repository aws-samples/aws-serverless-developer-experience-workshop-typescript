// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  Context,
  DynamoDBStreamEvent,
  AttributeValue,
  DynamoDBBatchResponse,
} from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  SFNClient,
  SendTaskSuccessCommand,
  SendTaskSuccessCommandInput,
} from "@aws-sdk/client-sfn";

// Empty configuration for SFN
const sfnClient = new SFNClient({});

export type ContractStatus = {
  contract_id?: string;
  contract_status?: string;
  property_id: string;
  sfn_wait_approved_task_token?: string;
};

class PropertiesApprovalSyncFunction implements LambdaInterface {
  /**
   * Handle the contract update stream from the dynamodb table.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {void}
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: DynamoDBStreamEvent,
    context: Context
  ): Promise<DynamoDBBatchResponse> {
    logger.info(
      `DynamodDB stream processing triggered ${JSON.stringify(event)}`
    );
    // Track results.
    const results: DynamoDBBatchResponse = { batchItemFailures: [] };

    // Check the contract id and approval state
    for (let i = 0; i < event.Records.length; i++) {
      const record = event.Records[i];
      const newImage: ContractStatus | undefined =
        this.unmarshallContractStatus(record.dynamodb?.NewImage);
      const oldImage: ContractStatus | undefined =
        this.unmarshallContractStatus(record.dynamodb?.OldImage);
      try {
        if (newImage === undefined) {
          // Nothing to do.
          logger.warn(`Event had an undefined NEW_IMAGE ${record.eventID}`);
          continue;
        }

        const mergedImage: ContractStatus = { ...oldImage, ...newImage };

        // Check if there's any work to be done.
        if (newImage.sfn_wait_approved_task_token !== undefined) {
          // We should be checking for Approval state.
          if (newImage.contract_status === "APPROVED") {
            // Let's send an update! Use the token from the merged image though.
            logger.info(
              `Sending CONTRACT APPROVED task success to token ${mergedImage.sfn_wait_approved_task_token}`
            );
            await this.sendTaskSuccess(
              mergedImage.sfn_wait_approved_task_token
            );
            logger.info(
              `Sent task success to token ${mergedImage.sfn_wait_approved_task_token}`
            );
          } else {
            logger.warn(
              `Contract ${mergedImage.contract_id} is not in APPROVED state. Skipping`
            );
          }
        } else {
          // Nothing to do, just an updated contract with no property approval workflow yet.
          logger.info(
            `Contract ${mergedImage.contract_id} has no property approval requested yet`
          );
        }
      } catch (error) {
        logger.error(
          `Failure during handling of event ${i}: ${JSON.stringify(
            record
          )} - error was ${JSON.stringify(error)}`
        );
        // Save the contract ID that caused the error.
        results.batchItemFailures.push({
          itemIdentifier: newImage?.contract_id ?? `Index: ${i}`,
        });
      }
    }

    return results;
  }

  /**
   * Unmarshall the contract status from the DynamoDB record
   * @param input
   * @returns
   */
  private unmarshallContractStatus(
    input: { [key: string]: AttributeValue } | undefined
  ): ContractStatus | undefined {
    if (input === undefined) {
      return undefined;
    }

    const result: ContractStatus = { property_id: "" };
    result.contract_id = input["contract_id"].S;
    result.property_id = input["property_id"].S ?? "";
    result.contract_status = input["contract_status"].S;
    if (input["sfn_wait_approved_task_token"] !== undefined) {
      result.sfn_wait_approved_task_token =
        input["sfn_wait_approved_task_token"].S;
    }

    return result;
  }

  /**
   * Send a TaskSuccess message back to the StepFunctions instance
   * @param taskToken
   */
  @tracer.captureMethod()
  private async sendTaskSuccess(taskToken: any): Promise<void> {
    const cmdInput: SendTaskSuccessCommandInput = {
      taskToken: taskToken,
      output: JSON.stringify({ ContractPublished: true }),
    };
    await sfnClient.send(new SendTaskSuccessCommand(cmdInput));
  }
}

export const myFunction = new PropertiesApprovalSyncFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
