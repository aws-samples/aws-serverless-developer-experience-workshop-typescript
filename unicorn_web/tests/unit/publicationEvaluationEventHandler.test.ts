// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, EventBridgeEvent } from 'aws-lambda';
import {
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { lambdaHandler } from '../../src/publication_manager_service/publicationEvaluationEventHandler';
import {
  createEventBridgeEvent,
  createLambdaContext,
} from './helpers/testHelpers';

const ddbMock = mockClient(DynamoDBClient);

const mockContext: Context = createLambdaContext();

const VALID_PROPERTY_ID = 'usa/anytown/main-street/111';

function buildEvaluationEvent(
  propertyId: string,
  evaluationResult: string
): EventBridgeEvent<string, any> {
  return createEventBridgeEvent(
    'PublicationEvaluationCompleted',
    'unicorn-approvals',
    {
      property_id: propertyId,
      evaluation_result: evaluationResult,
    }
  );
}

describe('PublicationEvaluationEventHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.DYNAMODB_TABLE = 'test-table';
  });

  it('should update status to APPROVED', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = buildEvaluationEvent(VALID_PROPERTY_ID, 'APPROVED');

    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    const updateCall = ddbMock.call(0);
    const input = updateCall.args[0].input as any;

    expect(input.Key).toEqual({
      PK: { S: 'PROPERTY#usa#anytown' },
      SK: { S: 'main-street#111' },
    });
    expect(input.ExpressionAttributeValues[':t'].S).toBe('APPROVED');
    expect(input.UpdateExpression).toBe('SET #s = :t');
  });

  it('should update status to DECLINED', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = buildEvaluationEvent(VALID_PROPERTY_ID, 'DECLINED');

    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    const updateCall = ddbMock.call(0);
    const input = updateCall.args[0].input as any;

    expect(input.ExpressionAttributeValues[':t'].S).toBe('DECLINED');
  });

  it('should not update for unknown evaluation result', async () => {
    const event = buildEvaluationEvent(VALID_PROPERTY_ID, 'UNKNOWN_STATUS');

    await lambdaHandler(event, mockContext);

    // Should not attempt DynamoDB update for unknown result
    expect(ddbMock.calls()).toHaveLength(0);
  });

  it('should handle invalid property_id', async () => {
    const event = buildEvaluationEvent('invalid-id', 'APPROVED');

    // The handler catches the error from getDynamoDBKeys internally
    await lambdaHandler(event, mockContext);

    // Should not reach DynamoDB update since key parsing fails
    expect(ddbMock.calls()).toHaveLength(0);
  });
});
