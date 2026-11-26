// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, EventBridgeEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { lambdaHandler } from '../../src/approvals_service/contractStatusChangedEventHandler';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';

describe('Unit tests for contract creation', function () {
  const ddbMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  test('verifies successful response', async () => {
    let cmd: any;

    // A fixed literal: the handler must store this exact string, whatever the host clock or time zone
    const dateToCheck = '2022-08-25T01:44:02Z';

    async function verifyInput(input: any) {
      cmd = input as UpdateItemCommandInput;
      expect(cmd['Key']['property_id'].S).toEqual('property1');
      expect(cmd['ExpressionAttributeValues'][':c'].S).toEqual('contract1');
      expect(cmd['ExpressionAttributeValues'][':t'].S).toEqual('APPROVED');
      expect(cmd['ExpressionAttributeValues'][':m'].S).toEqual(dateToCheck);
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
        contract_last_modified_on: dateToCheck,
      },
      'detail-type': 'ContractStatusChanged',
    };

    await lambdaHandler(event, context);
  });

  test('should handle malformed event gracefully', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    // Event with missing detail fields - Marshaller will produce undefined values
    const event: EventBridgeEvent<string, any> = {
      id: expectedId,
      account: 'nullAccount',
      version: '0',
      time: 'nulltime',
      region: 'ap-southeast-2',
      source: 'unicorn-approvals',
      resources: [''],
      detail: {},
      'detail-type': 'ContractStatusChanged',
    };

    // The handler catches errors internally and does not rethrow
    await expect(lambdaHandler(event, context)).resolves.toBeUndefined();
  });

  test('should handle DDB failure gracefully', async () => {
    ddbMock
      .on(UpdateItemCommand)
      .rejects(new Error('DynamoDB service unavailable'));

    // A fixed literal: the handler must store this exact string, whatever the host clock or time zone
    const dateToCheck = '2022-08-25T01:44:02Z';
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
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
        contract_last_modified_on: dateToCheck,
      },
      'detail-type': 'ContractStatusChanged',
    };

    // The handler catches errors internally and does not rethrow
    await expect(lambdaHandler(event, context)).resolves.toBeUndefined();
  });
});
