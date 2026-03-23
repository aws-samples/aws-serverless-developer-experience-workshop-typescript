// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { lambdaHandler } from '../../src/search_service/propertySearchFunction';

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

const baseEvent: Partial<APIGatewayProxyEvent> = {
  httpMethod: 'GET',
  headers: {},
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  body: null,
  isBase64Encoded: false,
};

const approvedDdbItem = {
  PK: { S: 'PROPERTY#AU#Anytown' },
  SK: { S: 'Main Street#1337' },
  country: { S: 'AU' },
  city: { S: 'Anytown' },
  street: { S: 'Main Street' },
  number: { S: '1337' },
  description: { S: 'Test property' },
  currency: { S: 'USD' },
  listprice: { N: '200' },
  contract: { S: 'sale' },
  status: { S: 'APPROVED' },
};

const pendingDdbItem = {
  PK: { S: 'PROPERTY#AU#Anytown' },
  SK: { S: 'Other Street#42' },
  country: { S: 'AU' },
  city: { S: 'Anytown' },
  street: { S: 'Other Street' },
  number: { S: '42' },
  description: { S: 'Pending property' },
  currency: { S: 'USD' },
  listprice: { N: '100' },
  contract: { S: 'rent' },
  status: { S: 'PENDING' },
};

describe('PropertySearchFunction', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.DYNAMODB_TABLE = 'test-table';
  });

  // T005-01: List by city — results found
  it('T005-01: returns 200 with array of results for city search when APPROVED items found', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [approvedDdbItem, approvedDdbItem],
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/search/{country}/{city}',
      path: '/search/AU/Anytown',
      pathParameters: { country: 'AU', city: 'Anytown' },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  // T005-02: List by city — no items
  it('T005-02: returns 400 when DDB returns undefined Items for city search', async () => {
    ddbMock.on(QueryCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/search/{country}/{city}',
      path: '/search/AU/Emptytown',
      pathParameters: { country: 'AU', city: 'Emptytown' },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(400);
  });

  // T005-03: List by city — filters non-APPROVED
  it('T005-03: filters out non-APPROVED items and returns only APPROVED in city search', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [approvedDdbItem, pendingDdbItem],
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/search/{country}/{city}',
      path: '/search/AU/Anytown',
      pathParameters: { country: 'AU', city: 'Anytown' },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0].status).toBe('APPROVED');
  });

  // T005-04: List by street — results found
  it('T005-04: returns 200 with results for street search', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [approvedDdbItem],
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/search/{country}/{city}/{street}',
      path: '/search/AU/Anytown/Main Street',
      pathParameters: { country: 'AU', city: 'Anytown', street: 'Main Street' },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
  });

  // T005-05: Property details — found and APPROVED
  it('T005-05: returns 200 with property detail when item found and status is APPROVED', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: approvedDdbItem,
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/AU/Anytown/Main Street/1337',
      pathParameters: {
        country: 'AU',
        city: 'Anytown',
        street: 'Main Street',
        number: '1337',
      },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('APPROVED');
  });

  // T005-06: Property details — found but not APPROVED
  it('T005-06: returns 404 when property found but status is not APPROVED', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: pendingDdbItem,
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/AU/Anytown/Other Street/42',
      pathParameters: {
        country: 'AU',
        city: 'Anytown',
        street: 'Other Street',
        number: '42',
      },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(404);
  });

  // T005-07: Property details — not found
  it('T005-07: returns 404 when property Item is not found in DDB', async () => {
    ddbMock.on(GetItemCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event = {
      ...baseEvent,
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/AU/Ghosttown/Nowhere/0',
      pathParameters: {
        country: 'AU',
        city: 'Ghosttown',
        street: 'Nowhere',
        number: '0',
      },
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(404);
  });

  // T005-08: Unknown resource
  it('T005-08: returns 400 for unknown resource', async () => {
    const event = {
      ...baseEvent,
      resource: '/unknown',
      path: '/unknown',
      pathParameters: null,
    } as APIGatewayProxyEvent;

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(400);
  });
});
