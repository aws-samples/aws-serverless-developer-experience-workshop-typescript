// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { lambdaHandler } from '../../src/approvals_service/waitForContractApprovalFunction';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBClient,
  GetItemCommandInput,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

describe('Unit tests for contract status checking', function () {
  const ddbMock = mockClient(DynamoDBClient);

  const baselineStepFunctionEvent = {
    Input: {
      property_id: 'PROPERTY/australia#sydney/low#23',
      country: 'Australia',
      city: 'Sydney',
      street: 'Low',
      propertyNumber: '23',
      description: 'First property',
      contract_id: 'contract1',
      listPrice: 23422222,
      currency: 'AUD',
      images: 's3://filepath',
      propertyStatus: 'NEW',
    },
    TaskToken: 'tasktoken1',
  };

  beforeEach(() => {
    ddbMock.reset();
  });

  // T004-01: Contract approved — returns 200 with property data
  test('verifies approved check', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyGet(input: any) {
      const cmd = (input as GetItemCommandInput) ?? {};
      const key = cmd['Key'] ?? {};
      expect(key['property_id'].S).toEqual('PROPERTY/australia#sydney/low#23');
      return {
        $metadata: {
          httpStatusCode: 200,
        },
        Item: {
          contract_id: { S: 'contract1' },
          property_id: { S: 'PROPERTY/australia#sydney/low#23' },
          contract_status: { S: 'APPROVED' },
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key['property_id'].S).toEqual(
          'PROPERTY/australia#sydney/low#23'
        );
        expect(expressionAttributeValues[':t'].S).toEqual('tasktoken1');
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        fail(error);
      }
    }

    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
      property_id: 'PROPERTY/australia#sydney/low#23',
      country: 'Australia',
      city: 'Sydney',
      street: 'Low',
      propertyNumber: '23',
      description: 'First property',
      contract_id: 'contract1',
      listPrice: 23422222,
      currency: 'AUD',
      images: 's3://filepath',
      propertyStatus: 'NEW',
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  // T004-02: Contract unapproved (DRAFT) — returns 200 with property data
  test('verifies unapproved check', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyGet(input: any) {
      try {
        const cmd = (input as GetItemCommandInput) ?? {};
        const key = cmd['Key'] ?? {};
        expect(key['property_id'].S).toEqual(
          'PROPERTY/australia#sydney/low#23'
        );
        return {
          $metadata: {
            httpStatusCode: 200,
          },
          Item: {
            contract_id: { S: 'contract1' },
            property_id: { S: 'PROPERTY/australia#sydney/low#23' },
            contract_status: { S: 'DRAFT' },
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        fail(error);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key['property_id'].S).toEqual(
          'PROPERTY/australia#sydney/low#23'
        );
        expect(expressionAttributeValues[':t'].S).toEqual('tasktoken1');
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        fail(error);
      }
    }
    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
      property_id: 'PROPERTY/australia#sydney/low#23',
      country: 'Australia',
      city: 'Sydney',
      street: 'Low',
      propertyNumber: '23',
      description: 'First property',
      contract_id: 'contract1',
      listPrice: 23422222,
      currency: 'AUD',
      images: 's3://filepath',
      propertyStatus: 'NEW',
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  // T004-03: No contract found — returns 200 with property data
  test('verifies no contract check', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyGet(input: any) {
      try {
        const cmd = (input as GetItemCommandInput) ?? {};
        const key = cmd['Key'] ?? {};
        expect(key['property_id'].S).toEqual(
          'PROPERTY/australia#sydney/low#23'
        );
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        fail(error);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function verifyUpdate(input: any) {
      try {
        const cmd = input as UpdateItemCommandInput;
        const key = cmd.Key ?? {};
        const expressionAttributeValues = cmd.ExpressionAttributeValues ?? {};
        expect(key['property_id'].S).toEqual(
          'PROPERTY/australia#sydney/low#23'
        );
        expect(expressionAttributeValues[':t'].S).toEqual('tasktoken1');
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        fail(error);
      }
    }
    ddbMock.callsFakeOnce(verifyGet).callsFakeOnce(verifyUpdate);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedBody = JSON.stringify({
      property_id: 'PROPERTY/australia#sydney/low#23',
      country: 'Australia',
      city: 'Sydney',
      street: 'Low',
      propertyNumber: '23',
      description: 'First property',
      contract_id: 'contract1',
      listPrice: 23422222,
      currency: 'AUD',
      images: 's3://filepath',
      propertyStatus: 'NEW',
    });
    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toEqual(200);
  });

  // T004-04: DDB UpdateItem failure (non-200)
  test('should return 500 when UpdateItem returns non-200', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getSuccess(_input: any) {
      return {
        $metadata: { httpStatusCode: 200 },
        Item: {
          contract_id: { S: 'contract1' },
          property_id: { S: 'PROPERTY/australia#sydney/low#23' },
          contract_status: { S: 'APPROVED' },
        },
      };
    }

    function updateFail() {
      return {
        $metadata: { httpStatusCode: 500 },
      };
    }

    ddbMock.callsFakeOnce(getSuccess).callsFakeOnce(updateFail);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: Context = { awsRequestId: randomUUID() } as any;
    const response = await lambdaHandler(baselineStepFunctionEvent, context);

    expect(response.statusCode).toEqual(500);
  });

  // T004-05: Missing property_id in event input
  test('should return 500 when property_id is missing', async () => {
    const eventWithoutPropertyId = {
      Input: {
        country: 'Australia',
        city: 'Sydney',
      },
      TaskToken: 'tasktoken1',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context: Context = { awsRequestId: randomUUID() } as any;
    const response = await lambdaHandler(eventWithoutPropertyId, context);

    expect(response.statusCode).toEqual(500);
  });
});
