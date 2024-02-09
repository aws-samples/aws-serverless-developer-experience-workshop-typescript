// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  SFNClient,
  SendTaskSuccessCommand,
  SendTaskSuccessCommandInput,
} from "@aws-sdk/client-sfn";

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
  sfn_wait_approved_task_token?: string;
};

export interface ContractStatusError extends Error {
  property_id: string;
  name: string;
  object: any;
}

class ContractStatusCheckerFunction {
  /**
   * Handle the contract status checking.
   * @param {Object} event - EventBridge Event Input Format
   * @returns {StepFunctionsResponse}
   *
   */
  public async handler(
    event: any,
    context: Context
  ): Promise<StepFunctionsResponse> {
    console.log(`Step Function event triggered ${JSON.stringify(event)}`);
    try {
      // Get the task token and contract id from the input
      const input = event.Input;
      const propertyId = input.property_id;
      const taskToken = event.TaskToken;

      console.log(`Input: ${JSON.stringify(input)}`);
      console.log(`Task Token: ${taskToken}`);

      // Look for the contract in the ContractStatusTable and check it's status
      console.log(`Get property for property: ${propertyId}`);
      const currentStatus = await this.getContractStatusItemFor(propertyId);
      console.log(`Current status is ${JSON.stringify(currentStatus)}`);

      // Just force the update of the token in the table. If the status is already approved, the
      // propertiesApprovalSync will be invoked from the DynamoDB update and that will
      // sendTaskSuccess on the task.
      console.log(`Updating task token for property: ${propertyId}`);
      // Create a placeholder status to update with the task token.
      const status: ContractStatus = {
        contract_id: "",
        property_id: propertyId,
        contract_status: "Unknown",
        sfn_wait_approved_task_token: taskToken,
      };
      await this.updateTaskToken(status);
      console.log(`Contract status updated`);
      return { statusCode: 200, body: JSON.stringify(input) };
    } catch (error: any) {
      console.log(
        `Error during Contract Status Check: ${JSON.stringify(error)}`
      );
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }
  }

  /**
   * Get the ContractStatus for this propertyId
   * @param propertyId
   * @returns
   */
  private async getContractStatusItemFor(
    propertyId: string
  ): Promise<ContractStatus | undefined> {
    const getItemCommandInput: GetItemCommandInput = {
      Key: { property_id: { S: propertyId } },
      ProjectionExpression:
        "contract_id, property_id, contract_status, sfn_wait_approved_task_token",
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new GetItemCommand(getItemCommandInput));
    if (data.Item === undefined) {
      return undefined;
    } else {
      return unmarshall(data.Item) as ContractStatus;
    }
  }

  /**
   * Update the task token passed in by StepFunctions for this ContractStatus
   * @param status
   */
  private async updateTaskToken(status: ContractStatus): Promise<void> {
    // Build the Command objects
    const ddbUpdateCommandInput: UpdateItemCommandInput = {
      TableName: DDB_TABLE,
      Key: { property_id: { S: status.property_id } },
      UpdateExpression: "set sfn_wait_approved_task_token = :t",
      ExpressionAttributeValues: {
        ":t": { S: status.sfn_wait_approved_task_token ?? "" },
      },
    };
    const ddbUpdateCommand = new UpdateItemCommand(ddbUpdateCommandInput);

    // Send the command
    const ddbUpdateCommandOutput: UpdateItemCommandOutput =
      await ddbClient.send(ddbUpdateCommand);
    if (ddbUpdateCommandOutput.$metadata.httpStatusCode != 200) {
      const error: ContractStatusError = {
        property_id: status.property_id,
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

export const myFunction = new ContractStatusCheckerFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
