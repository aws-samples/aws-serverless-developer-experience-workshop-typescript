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
    console.log(event);
    return;
  }
}

export const myFunction = new ContractEventHandlerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
