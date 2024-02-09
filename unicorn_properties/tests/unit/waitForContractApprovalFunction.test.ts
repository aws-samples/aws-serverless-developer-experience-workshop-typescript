// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import { randomUUID } from "crypto";
import { lambdaHandler } from "../../src/properties_service/waitForContractApprovalFunction";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  GetItemCommandInput,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

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
    TaskToken: "tasktoken1",
  };

  beforeEach(() => {
    ddbMock.reset();
  });

  test("verifies approved check", async () => {
    function verifyGet(input: any) {
      const cmd = (input as GetItemCommandInput) ?? {};
      const key = cmd["Key"] ?? {};
      expect(key["property_id"].S).toEqual("PROPERTY/australia#sydney/low#23");
      return {
        $metadata: {
          httpStatusCode: 200,
        },
        Item: {
          contract_id: { S: "contract1" },
          property_id: { S: "PROPERTY/australia#sydney/low#23" },
          contract_status: { S: "APPROVED" },
        },
      };
    }

    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key["property_id"].S).toEqual(
          "PROPERTY/australia#sydney/low#23",
        );
        expect(expressionAttributeValues[":t"].S).toEqual("tasktoken1");
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }

    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
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
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  test("verifies unapproved check", async () => {
    function verifyGet(input: any) {
      try {
        const cmd = (input as GetItemCommandInput) ?? {};
        const key = cmd["Key"] ?? {};
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
            contract_status: { S: "DRAFT" },
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }

    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key["property_id"].S).toEqual(
          "PROPERTY/australia#sydney/low#23",
        );
        expect(expressionAttributeValues[":t"].S).toEqual("tasktoken1");
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }
    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
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
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  test("verifies no contract check", async () => {
    function verifyGet(input: any) {
      try {
        const cmd = (input as GetItemCommandInput) ?? {};
        const key = cmd["Key"] ?? {};
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

    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key["property_id"].S).toEqual(
          "PROPERTY/australia#sydney/low#23",
        );
        expect(expressionAttributeValues[":t"].S).toEqual("tasktoken1");
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
      } catch (error: any) {
        fail(error);
      }
    }
    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
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
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });
});
