// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, EventBridgeEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { lambdaHandler } from '../../src/approvals_service/contractStatusChangedEventHandler';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBClient,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

describe('Unit tests for contract creation', function () {
  const ddbMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  // T002-01: Successful contract status update
  test('verifies successful response', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cmd: any;

    const dateToCheck = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function verifyInput(input: any) {
      cmd = input as UpdateItemCommandInput;
      expect(cmd['Key']['property_id'].S).toEqual('property1');
      expect(cmd['ExpressionAttributeValues'][':c'].S).toEqual('contract1');
      expect(cmd['ExpressionAttributeValues'][':t'].S).toEqual('APPROVED');
      expect(cmd['ExpressionAttributeValues'][':m'].S).toEqual(
        dateToCheck.toISOString()
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: EventBridgeEvent<string, any> = {
      id: expectedId,
      account: 'nullAccount',
      version: '0',
      time: 'nulltime',
      region: 'ap-southeast-2',
      source: 'unicorn-approvals',
      resources: [''],
      detail: {
        contract_id: 'contract1',
        property_id: 'property1',
        contract_status: 'APPROVED',
        contract_last_modified_on: dateToCheck.toISOString(),
      },
      'detail-type': 'ContractStatusChanged',
    };

    await lambdaHandler(event, context);
  });

  // T002-02: DDB returns non-200 → ContractStatusError thrown internally, caught by handler
  test('should not propagate error when DDB returns non-200', async () => {
    ddbMock.callsFake(() => ({
      $metadata: { httpStatusCode: 500 },
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: EventBridgeEvent<string, any> = {
      id: randomUUID(),
      account: 'nullAccount',
      version: '0',
      time: 'nulltime',
      region: 'ap-southeast-2',
      source: 'unicorn-approvals',
      resources: [''],
      detail: {
        contract_id: 'contract1',
        property_id: 'property1',
        contract_status: 'APPROVED',
        contract_last_modified_on: new Date().toISOString(),
      },
      'detail-type': 'ContractStatusChanged',
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lambdaHandler(event, { awsRequestId: randomUUID() } as any)
    ).resolves.toBeUndefined();
  });

  // T002-03: Unmarshalling failure — malformed event.detail
  test('should not propagate error when event.detail is malformed', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: EventBridgeEvent<string, any> = {
      id: randomUUID(),
      account: 'nullAccount',
      version: '0',
      time: 'nulltime',
      region: 'ap-southeast-2',
      source: 'unicorn-approvals',
      resources: [''],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detail: null as any,
      'detail-type': 'ContractStatusChanged',
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lambdaHandler(event, { awsRequestId: randomUUID() } as any)
    ).resolves.toBeUndefined();
  });

  // T002-04: Metric emitted on any call (handler completes without throwing, metric line is reached)
  test('should complete without error on successful call (metric emitted)', async () => {
    ddbMock.callsFake(() => ({
      $metadata: { httpStatusCode: 200 },
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: EventBridgeEvent<string, any> = {
      id: randomUUID(),
      account: 'nullAccount',
      version: '0',
      time: 'nulltime',
      region: 'ap-southeast-2',
      source: 'unicorn-approvals',
      resources: [''],
      detail: {
        contract_id: 'contract1',
        property_id: 'property1',
        contract_status: 'APPROVED',
        contract_last_modified_on: new Date().toISOString(),
      },
      'detail-type': 'ContractStatusChanged',
    };

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lambdaHandler(event, { awsRequestId: randomUUID() } as any)
    ).resolves.toBeUndefined();
  });
});
