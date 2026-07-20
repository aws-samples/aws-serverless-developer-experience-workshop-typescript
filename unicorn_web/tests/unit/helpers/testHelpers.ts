// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  Context,
  SQSEvent,
  SQSRecord,
  EventBridgeEvent,
  APIGatewayProxyEvent,
} from 'aws-lambda';

/**
 * Create a mock Lambda Context object.
 */
export function createLambdaContext(overrides?: Partial<Context>): Context {
  return {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn:
      'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: '12345678-1234-1234-1234-123456789012',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2024/01/01/[$LATEST]123456789',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
    ...overrides,
  };
}

/**
 * Create a single SQS Record with the given body.
 */
export function createSQSRecord(body: Record<string, any>): SQSRecord {
  return {
    messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
    receiptHandle: 'MessageReceiptHandle',
    body: JSON.stringify(body),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1672531200000',
      SenderId: 'XXXXXXXXXXXXXXXXXXXXX',
      ApproximateFirstReceiveTimestamp: '1672531200001',
    },
    messageAttributes: {},
    md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
    awsRegion: 'us-east-1',
  };
}

/**
 * Create an SQS Event with one or more records.
 */
export function createSQSEvent(
  bodies: Record<string, any> | Record<string, any>[]
): SQSEvent {
  const records = Array.isArray(bodies) ? bodies : [bodies];
  return {
    Records: records.map((b) => createSQSRecord(b)),
  };
}

/**
 * Create an EventBridge event for testing.
 */
export function createEventBridgeEvent<T>(
  detailType: string,
  source: string,
  detail: T
): EventBridgeEvent<string, T> {
  return {
    id: '12345678-1234-1234-1234-123456789012',
    account: '123456789012',
    version: '0',
    time: '2024-01-01T00:00:00Z',
    region: 'us-east-1',
    source,
    resources: [],
    detail,
    'detail-type': detailType,
  };
}

/**
 * Create an API Gateway Proxy Request event for testing.
 */
export function createAPIGatewayProxyEvent(
  overrides: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent {
  return {
    httpMethod: overrides.httpMethod ?? 'GET',
    path: overrides.path ?? '/',
    resource: overrides.resource ?? '/',
    pathParameters: overrides.pathParameters ?? null,
    queryStringParameters: overrides.queryStringParameters ?? null,
    headers: overrides.headers ?? {},
    multiValueHeaders: overrides.multiValueHeaders ?? {},
    multiValueQueryStringParameters:
      overrides.multiValueQueryStringParameters ?? null,
    stageVariable: null,
    isBase64Encoded: false,
    body: overrides.body ?? null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'testapi',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: overrides.httpMethod ?? 'GET',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test-agent',
        userArn: null,
      },
      path: overrides.path ?? '/',
      stage: 'test',
      requestId: '12345678-1234-1234-1234-123456789012',
      requestTimeEpoch: 1672531200000,
      resourceId: 'testresource',
      resourcePath: overrides.resource ?? '/',
    },
  };
}
