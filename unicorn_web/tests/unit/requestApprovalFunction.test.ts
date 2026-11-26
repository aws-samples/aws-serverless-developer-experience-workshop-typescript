// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { SQSEvent, Context } from 'aws-lambda';
import {
  DynamoDBClient,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { lambdaHandler } from '../../src/publication_manager_service/requestApprovalFunction';
import { createSQSEvent, createLambdaContext } from './helpers/testHelpers';

const ddbMock = mockClient(DynamoDBClient);
const eventBridgeMock = mockClient(EventBridgeClient);

const mockContext: Context = createLambdaContext();

const VALID_PROPERTY_ID = 'usa/anytown/main-street/111';

const PROPERTY_DB_ITEM = {
  PK: 'PROPERTY#usa#anytown',
  SK: 'main-street#111',
  country: 'usa',
  city: 'anytown',
  street: 'main-street',
  number: '111',
  description: 'A lovely property',
  listprice: 500000,
  currency: 'USD',
  status: 'NEW',
  images: ['image1.jpg'],
};

describe('RequestApprovalFunction', () => {
  beforeEach(() => {
    ddbMock.reset();
    eventBridgeMock.reset();

    process.env.DYNAMODB_TABLE = 'test-table';
    process.env.EVENT_BUS = 'test-event-bus';
    process.env.SERVICE_NAMESPACE = 'unicorn-web';
  });

  it('should query property and publish EventBridge event', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(PROPERTY_DB_ITEM),
      $metadata: { httpStatusCode: 200 },
    });

    eventBridgeMock.on(PutEventsCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      FailedEntryCount: 0,
      Entries: [{ EventId: 'event-id-1' }],
    });

    const sqsEvent: SQSEvent = createSQSEvent({
      property_id: VALID_PROPERTY_ID,
    });

    await lambdaHandler(sqsEvent, mockContext);

    // Verify DynamoDB was queried with correct keys
    expect(ddbMock.calls()).toHaveLength(1);
    const ddbCall = ddbMock.call(0);
    expect((ddbCall.args[0].input as any).Key).toEqual({
      PK: { S: 'PROPERTY#usa#anytown' },
      SK: { S: 'main-street#111' },
    });

    // Verify EventBridge event was published
    expect(eventBridgeMock.calls()).toHaveLength(1);
    const ebCall = eventBridgeMock.call(0);
    const entries = (ebCall.args[0].input as any).Entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].DetailType).toBe('PublicationApprovalRequested');
    expect(entries[0].Source).toBe('unicorn-web');

    const detail = JSON.parse(entries[0].Detail);
    expect(detail.property_id).toBe(VALID_PROPERTY_ID);
    expect(detail.status).toBe('PENDING');
    expect(detail.address.country).toBe('usa');
    expect(detail.address.city).toBe('anytown');
    expect(detail.address.street).toBe('main-street');
    expect(detail.address.number).toBe('111');
    expect(detail.description).toBe('A lovely property');
  });

  it('should skip invalid property_id format', async () => {
    const sqsEvent: SQSEvent = createSQSEvent({
      property_id: 'invalid-id',
    });

    await lambdaHandler(sqsEvent, mockContext);

    // Should not call DynamoDB or EventBridge
    expect(ddbMock.calls()).toHaveLength(0);
    expect(eventBridgeMock.calls()).toHaveLength(0);
  });

  it('should skip already APPROVED property', async () => {
    // The publish guard uses ['APPROVED'].includes(property.status), correctly
    // checking membership. Already-approved properties should be skipped: no
    // duplicate EventBridge event is published.
    const approvedProperty = {
      ...PROPERTY_DB_ITEM,
      status: 'APPROVED',
    };

    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(approvedProperty),
      $metadata: { httpStatusCode: 200 },
    });

    eventBridgeMock.on(PutEventsCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      FailedEntryCount: 0,
      Entries: [{ EventId: 'event-id-1' }],
    });

    const sqsEvent: SQSEvent = createSQSEvent({
      property_id: VALID_PROPERTY_ID,
    });

    await lambdaHandler(sqsEvent, mockContext);

    // DynamoDB was queried
    expect(ddbMock.calls()).toHaveLength(1);
    // Already-APPROVED property is skipped; no duplicate event is published.
    expect(eventBridgeMock.calls()).toHaveLength(0);
  });

  it('should handle property not found in DynamoDB', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: undefined,
      $metadata: { httpStatusCode: 200 },
    });

    const sqsEvent: SQSEvent = createSQSEvent({
      property_id: VALID_PROPERTY_ID,
    });

    // Should not throw; error is caught internally
    await lambdaHandler(sqsEvent, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    expect(eventBridgeMock.calls()).toHaveLength(0);
  });

  it('should handle EventBridge failure', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(PROPERTY_DB_ITEM),
      $metadata: { httpStatusCode: 200 },
    });

    eventBridgeMock.on(PutEventsCommand).resolves({
      $metadata: { httpStatusCode: 500 },
      FailedEntryCount: 1,
      Entries: [],
    });

    const sqsEvent: SQSEvent = createSQSEvent({
      property_id: VALID_PROPERTY_ID,
    });

    // Should not throw; error is caught internally
    await lambdaHandler(sqsEvent, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    expect(eventBridgeMock.calls()).toHaveLength(1);
  });
});
