// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, EventBridgeEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { lambdaHandler } from "../../src/properties_service/contractStatusChangedEventHandler";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

describe("Unit tests for contract creation", function () {
  const ddbMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  test("verifies successful response", async () => {
    let cmd: any;

    const dateToCheck = new Date();

    async function verifyInput(input: any) {
      cmd = input as UpdateItemCommandInput;
      expect(cmd["Key"]["property_id"].S).toEqual("property1");
      expect(cmd["ExpressionAttributeValues"][":c"].S).toEqual("contract1");
      expect(cmd["ExpressionAttributeValues"][":t"].S).toEqual("APPROVED");
      expect(cmd["ExpressionAttributeValues"][":t"].S).toEqual(
        dateToCheck.toISOString(),
      );
      return {
        $metadata: {
          httpStatusCode: 200,
        },
      };
    }

    ddbMock.callsFake(verifyInput);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    const event: EventBridgeEvent<string, any> = {
      id: expectedId,
      account: "nullAccount",
      version: "0",
      time: "nulltime",
      region: "ap-southeast-2",
      source: "unicorn.properties",
      resources: [""],
      detail: {
        contract_id: "contract1",
        property_id: "property1",
        contract_status: "APPROVED",
        contract_last_modified_on: dateToCheck.toISOString(),
      },
      "detail-type": "Contract updated",
    };

    await lambdaHandler(event, context);
  });
});
