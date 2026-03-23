// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { EventBridgeEvent, Context } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

// Mock powertools before importing the handler so decorators are no-ops
jest.mock('../../src/publication_manager_service/powertools', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    injectLambdaContext:
      () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_target: any, _key: string, descriptor: PropertyDescriptor) =>
        descriptor,
  },
  metrics: {
    addMetric: jest.fn(),
    logMetrics:
      () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_target: any, _key: string, descriptor: PropertyDescriptor) =>
        descriptor,
  },
  tracer: {
    captureLambdaHandler:
      () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_target: any, _key: string, descriptor: PropertyDescriptor) =>
        descriptor,
    captureMethod:
      () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (_target: any, _key: string, descriptor: PropertyDescriptor) =>
        descriptor,
    putAnnotation: jest.fn(),
    addErrorAsMetadata: jest.fn(),
  },
}));

import { lambdaHandler } from '../../src/publication_manager_service/publicationEvaluationEventHandler';
import {
  metrics,
  tracer,
} from '../../src/publication_manager_service/powertools';

const ddbMock = mockClient(DynamoDBClient);

const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn:
    'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: '123456-7890-1234-5678-12345678',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2024/01/01/[$LATEST]123456789',
  getRemainingTimeInMillis: () => 1000,
  /* eslint-disable @typescript-eslint/no-empty-function */
  done: () => {},
  fail: () => {},
  succeed: () => {},
};

// Detail is snake_case at runtime (unmarshalled by handler); use 'any' to avoid type mismatch
const makeEvent = (
  detail: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): EventBridgeEvent<string, any> => ({
  version: '0',
  id: 'test-event-id',
  'detail-type': 'PublicationEvaluationCompleted',
  source: 'unicorn.properties',
  account: '123456789012',
  time: '2024-01-01T00:00:00Z',
  region: 'us-east-1',
  resources: [],
  detail,
});

describe('PublicationEvaluationEventHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.DYNAMODB_TABLE = 'test-table';
    jest.clearAllMocks();
  });

  // T007-01: APPROVED result
  it('T007-01: calls DDB UpdateItem with status APPROVED for APPROVED evaluationResult', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = makeEvent({
      evaluation_result: 'APPROVED',
      property_id: 'US/Anytown/Main Street/1',
    });
    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = ddbMock.calls()[0].args[0].input as any;
    expect(input.ExpressionAttributeValues[':t'].S).toBe('APPROVED');
  });

  // T007-02: DECLINED result
  it('T007-02: calls DDB UpdateItem with status DECLINED for DECLINED evaluationResult', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = makeEvent({
      evaluation_result: 'DECLINED',
      property_id: 'US/Anytown/Main Street/1',
    });
    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = ddbMock.calls()[0].args[0].input as any;
    expect(input.ExpressionAttributeValues[':t'].S).toBe('DECLINED');
  });

  // T007-03: Unknown evaluation result
  it('T007-03: does not call DDB when evaluationResult is an unknown value', async () => {
    const event = makeEvent({
      evaluation_result: 'UNKNOWN',
      property_id: 'US/Anytown/Main Street/1',
    });
    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(0);
  });

  // T007-04: Invalid propertyId format
  it('T007-04: handles error gracefully when propertyId has fewer than 4 components', async () => {
    const event = makeEvent({
      evaluation_result: 'APPROVED',
      property_id: 'invalid/id',
    });

    // Handler catches the error — resolves without throwing
    await expect(lambdaHandler(event, mockContext)).resolves.toBeUndefined();
    expect(ddbMock.calls()).toHaveLength(0);
    expect(tracer.addErrorAsMetadata).toHaveBeenCalled();
  });

  // T007-05: Case-insensitive evaluation result
  it('T007-05: calls DDB when evaluationResult is lowercase "approved"', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = makeEvent({
      evaluation_result: 'approved',
      property_id: 'US/Anytown/Main Street/1',
    });
    await lambdaHandler(event, mockContext);

    expect(ddbMock.calls()).toHaveLength(1);
  });

  // T007-06: DDB returns non-200
  it('T007-06: handles DDB non-200 response gracefully without throwing', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 500 },
    });

    const event = makeEvent({
      evaluation_result: 'APPROVED',
      property_id: 'US/Anytown/Main Street/1',
    });

    await expect(lambdaHandler(event, mockContext)).resolves.toBeUndefined();
    expect(tracer.addErrorAsMetadata).toHaveBeenCalled();
  });

  // T007-07: Metric emission
  it('T007-07: emits PropertiesApproved metric with Count=1 on every invocation', async () => {
    ddbMock.on(UpdateItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = makeEvent({
      evaluation_result: 'APPROVED',
      property_id: 'US/Anytown/Main Street/1',
    });
    await lambdaHandler(event, mockContext);

    expect(metrics.addMetric).toHaveBeenCalledWith(
      'PropertiesApproved',
      expect.anything(),
      1
    );
  });
});
