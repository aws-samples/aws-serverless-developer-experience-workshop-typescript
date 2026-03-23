// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, SQSEvent } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { lambdaHandler } from '../../src/publication_manager_service/requestApprovalFunction';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { marshall } from '@aws-sdk/util-dynamodb';

describe('Unit tests for RequestApprovalFunction', function () {
  const ddbMock = mockClient(DynamoDBClient);
  const ebMock = mockClient(EventBridgeClient);

  const context: Context = {
    awsRequestId: randomUUID(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  beforeEach(() => {
    ddbMock.reset();
    ebMock.reset();
  });

  function makeSqsEvent(propertyId: string): SQSEvent {
    return {
      Records: [
        {
          messageId: randomUUID(),
          receiptHandle: 'handle',
          body: JSON.stringify({ property_id: propertyId }),
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1',
            SenderId: 'sender',
            ApproximateFirstReceiveTimestamp: '1',
          },
          messageAttributes: {},
          md5OfBody: 'md5',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:TestQueue',
          awsRegion: 'us-east-1',
        },
      ],
    };
  }

  function makePropertyItem(status: string) {
    return marshall({
      PK: 'PROPERTY#usa#anytown',
      SK: 'main-street#111',
      country: 'USA',
      city: 'Anytown',
      street: 'main-street',
      number: '111',
      description: 'Test property',
      currency: 'USD',
      status,
    });
  }

  // T006-01: Valid property fires EventBridge event
  test('T006-01: valid property fires PublicationApprovalRequested event', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      Item: makePropertyItem('NEW'),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedEntry: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ebMock.on(PutEventsCommand).callsFake((input: any) => {
      capturedEntry = input.Entries[0];
      return {
        $metadata: { httpStatusCode: 200 },
        FailedEntryCount: 0,
        Entries: [{ EventId: randomUUID() }],
      };
    });

    await lambdaHandler(makeSqsEvent('USA/Anytown/main-street/111'), context);

    expect(ebMock.calls()).toHaveLength(1);
    expect(capturedEntry.DetailType).toEqual('PublicationApprovalRequested');
    const detail = JSON.parse(capturedEntry.Detail);
    expect(detail.property_id).toEqual('USA/Anytown/main-street/111');
    expect(detail.status).toEqual('PENDING');
  });

  // T006-02: Property already APPROVED — EB should not be called (validates R-001 fix)
  test('T006-02: property already APPROVED skips event publishing', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      Item: makePropertyItem('APPROVED'),
    });

    await lambdaHandler(makeSqsEvent('USA/Anytown/main-street/111'), context);

    expect(ebMock.calls()).toHaveLength(0);
  });

  // T006-03: Property not found in DDB
  test('T006-03: property not found returns without throwing', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      // No Item returned
    });

    await expect(
      lambdaHandler(makeSqsEvent('USA/Anytown/main-street/111'), context)
    ).resolves.toBeUndefined();
    expect(ebMock.calls()).toHaveLength(0);
  });

  // T006-04: Invalid property_id format (fewer than 4 slash-separated components)
  test('T006-04: invalid property_id format returns without throwing', async () => {
    await expect(
      lambdaHandler(makeSqsEvent('USA/Anytown'), context)
    ).resolves.toBeUndefined();
    expect(ddbMock.calls()).toHaveLength(0);
    expect(ebMock.calls()).toHaveLength(0);
  });

  // T006-05: EB PutEvents returns non-200 — error is caught and logged, handler resolves
  test('T006-05: EventBridge PutEvents failure is handled without throwing', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      Item: makePropertyItem('NEW'),
    });
    ebMock.on(PutEventsCommand).resolves({
      $metadata: { httpStatusCode: 400 },
      FailedEntryCount: 1,
      Entries: [],
    });

    await expect(
      lambdaHandler(makeSqsEvent('USA/Anytown/main-street/111'), context)
    ).resolves.toBeUndefined();
  });

  // T006-06: Multiple SQS records — requestApproval invoked for each
  test('T006-06: multiple SQS records each trigger requestApproval', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      Item: makePropertyItem('NEW'),
    });
    ebMock.on(PutEventsCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      FailedEntryCount: 0,
      Entries: [{ EventId: randomUUID() }],
    });

    const twoRecordEvent: SQSEvent = {
      Records: [
        ...makeSqsEvent('USA/Anytown/main-street/111').Records,
        ...makeSqsEvent('USA/Anytown/main-street/222').Records,
      ],
    };

    await lambdaHandler(twoRecordEvent, context);

    expect(ddbMock.calls()).toHaveLength(2);
    expect(ebMock.calls()).toHaveLength(2);
  });
});
