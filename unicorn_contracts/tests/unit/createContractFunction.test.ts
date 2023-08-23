// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { randomUUID } from "crypto";
import { lambdaHandler } from "../../src/contracts_service/createContractFunction";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { ContractStatusEnum } from "../../src/contracts_service/contractUtils";

describe("Unit tests for contract creation", function () {
  const ddbMock = mockClient(DynamoDBClient);
  const eventBridgeMock = mockClient(EventBridgeClient);

  beforeEach(() => {
    ddbMock.reset();
    eventBridgeMock.reset();
  });

  test("verifies successful response", async () => {
    let propertyId = "";
    let contractId = "";
    let createdAt = "";

    ddbMock.callsFake((input) => {
      const inputCommand = input as PutItemCommandInput;
      propertyId = inputCommand.Item?.property_id.S ?? "";
      contractId = inputCommand.Item?.contract_id.S ?? "";
      createdAt = inputCommand.Item?.contract_created.S ?? "";
      return {
        $metadata: {
          httpStatusCode: 200,
        },
      };
    });

    eventBridgeMock.on(PutEventsCommand).resolves({
      $metadata: {
        httpStatusCode: 200,
      },
    });

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        address: "St.1 , Building 10",
        seller_name: "John Smith",
        property_id: "4781231c-bc30-4f30-8b30-7145f4dd1adb",
      }),
    } as any;
    const context: Context = {
      awsRequestId: randomUUID(),
    } as any;
    const result = await lambdaHandler(event, context);
    expect(result.statusCode).toEqual(200);

    const expectedBody = {
      contract_id: contractId,
      contract_last_modified_on: createdAt,
      contract_status: ContractStatusEnum.DRAFT,
      property_id: propertyId,
    };
    expect(result.body).toEqual(JSON.stringify(expectedBody));
  });

  test("Invalid payload", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        address: "St.1 , Building 10",
        property_id: "4781231c-bc30-4f30-8b30-7145f4dd1adb",
      }),
    } as any;
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    const result = await lambdaHandler(event, context);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      JSON.stringify({ message: `Must specify contract details` })
    );
  });

  test("Failed database update", async () => {
    let contractId = "";
    let createdAt = "";

    ddbMock.callsFake((input) => {
      const inputCommand = input as PutItemCommandInput;
      contractId = inputCommand.Item?.contract_id.S ?? "";
      createdAt = inputCommand.Item?.created_at.S ?? "";
      console.log("INFO: " + contractId);
      return {
        $metadata: {
          httpStatusCode: 500,
        },
      };
    });

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        address: "St.1 , Building 10",
        seller_name: "John Smith",
        property_id: "4781231c-bc30-4f30-8b30-7145f4dd1adb",
      }),
    } as any;
    const expectedId = contractId;
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    const result = await lambdaHandler(event, context);
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({ error: `Unable to create contract ${contractId}` })
    );
  });

  test("Failed event fire", async () => {
    let contractId = "";
    let createdAt = "";

    ddbMock.callsFake((input) => {
      const inputCommand = input as PutItemCommandInput;
      contractId = inputCommand.Item?.contract_id.S ?? "";
      createdAt = inputCommand.Item?.contract_created.S ?? "";
      return {
        $metadata: {
          httpStatusCode: 200,
        },
      };
    });

    eventBridgeMock.on(PutEventsCommand).resolves({
      $metadata: {
        httpStatusCode: 500,
      },
    });

    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({
        address: "St.1 , Building 10",
        seller_name: "John Smith",
        property_id: "4781231c-bc30-4f30-8b30-7145f4dd1adb",
      }),
    } as any;
    const expectedId = contractId;
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    const result = await lambdaHandler(event, context);
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({
        error: `Unable to fire 'Contract created' event for contract ${contractId}`,
      })
    );
  });
});
