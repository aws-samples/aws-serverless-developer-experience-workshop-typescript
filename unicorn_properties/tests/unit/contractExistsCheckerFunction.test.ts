// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import { randomUUID } from "crypto";
import {
  lambdaHandler,
  ContractStatusNotFoundException,
} from "../../src/properties_service/contractExistsCheckerFunction";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommandInput } from "@aws-sdk/client-dynamodb";

describe("Unit tests for contract status checking", function () {
  const ddbMock = mockClient(DynamoDBClient);

  const baselineStepFunctionEvent = {
    Input: {
      property_id: "PROPERTY/australia#sydney/low#23",
      country: "Australia",
      city: "Sydney",
      street: "Low",
      propertyNumber: "23",
      description: "First property",
      contract_id: "contract1",
      listPrice: 23422222,
      currency: "AUD",
      images: "s3://filepath",
      propertyStatus: "NEW",
    },
  };

  beforeEach(() => {
    ddbMock.reset();
  });

  test("verifies contract exists check", async () => {
    function verifyGet(input: any) {
      try {
        let cmd = (input as GetItemCommandInput) ?? {};
        let key = cmd["Key"] ?? {};
        expect(key["property_id"].S).toEqual(
          "PROPERTY/australia#sydney/low#23",
        );
        return {
          $metadata: {
            httpStatusCode: 200,
          },
          Item: {
            contract_id: { S: "contract1" },
            property_id: { S: "PROPERTY/australia#sydney/low#23" },
            contract_status: { S: "Draft" },
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }

    ddbMock.callsFakeOnce(verifyGet);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    let expectedBody = JSON.stringify({
      contract_id: "contract1",
      property_id: "PROPERTY/australia#sydney/low#23",
      contract_status: "Draft",
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  test("verifies no contract check", async () => {
    function verifyGet(input: any) {
      try {
        let cmd = (input as GetItemCommandInput) ?? {};
        let key = cmd["Key"] ?? {};
        expect(key["property_id"].S).toEqual(
          "PROPERTY/australia#sydney/low#23",
        );
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }

    ddbMock.callsFakeOnce(verifyGet);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    try {
      const response = await lambdaHandler(baselineStepFunctionEvent, context);
      fail(`Excpected an exception`);
    } catch (error) {
      expect(error).toBeInstanceOf(ContractStatusNotFoundException);
      expect((error as ContractStatusNotFoundException).statusCode).toEqual(
        400,
      );
    }
  });
});
