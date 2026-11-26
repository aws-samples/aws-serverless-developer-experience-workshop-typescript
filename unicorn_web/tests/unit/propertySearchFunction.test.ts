// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from 'aws-lambda';
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { lambdaHandler } from '../../src/search_service/propertySearchFunction';
import {
  createAPIGatewayProxyEvent,
  createLambdaContext,
} from './helpers/testHelpers';

const ddbMock = mockClient(DynamoDBClient);

const mockContext: Context = createLambdaContext();

const APPROVED_PROPERTY = {
  country: 'usa',
  city: 'anytown',
  street: 'main-street',
  number: '111',
  description: 'A lovely property',
  listprice: 500000,
  currency: 'USD',
  status: 'APPROVED',
};

const PENDING_PROPERTY = {
  ...APPROVED_PROPERTY,
  status: 'PENDING',
};

describe('PropertySearchFunction', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.DYNAMODB_TABLE = 'test-table';
  });

  it('should search by city', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [marshall(APPROVED_PROPERTY)],
      $metadata: { httpStatusCode: 200 },
    });

    const event = createAPIGatewayProxyEvent({
      resource: '/search/{country}/{city}',
      path: '/search/usa/anytown',
      pathParameters: {
        country: 'usa',
        city: 'anytown',
      },
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0].city).toBe('anytown');
    expect(body[0].status).toBe('APPROVED');

    // Verify DynamoDB query
    expect(ddbMock.calls()).toHaveLength(1);
    const queryInput = ddbMock.call(0).args[0].input as any;
    expect(queryInput.ExpressionAttributeValues[':pk'].S).toBe(
      'PROPERTY#usa#anytown'
    );
  });

  it('should search by city and street', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [marshall(APPROVED_PROPERTY)],
      $metadata: { httpStatusCode: 200 },
    });

    const event = createAPIGatewayProxyEvent({
      resource: '/search/{country}/{city}/{street}',
      path: '/search/usa/anytown/main-street',
      pathParameters: {
        country: 'usa',
        city: 'anytown',
        street: 'main-street',
      },
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveLength(1);
    expect(body[0].street).toBe('main-street');

    // Verify DynamoDB query includes SK condition
    const queryInput = ddbMock.call(0).args[0].input as any;
    expect(queryInput.ExpressionAttributeValues[':sk'].S).toBe('main-street');
    expect(queryInput.KeyConditionExpression).toContain('begins_with');
  });

  it('should return property details', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(APPROVED_PROPERTY),
      $metadata: { httpStatusCode: 200 },
    });

    const event = createAPIGatewayProxyEvent({
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/usa/anytown/main-street/111',
      pathParameters: {
        country: 'usa',
        city: 'anytown',
        street: 'main-street',
        number: '111',
      },
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.country).toBe('usa');
    expect(body.city).toBe('anytown');
    expect(body.street).toBe('main-street');
    expect(body.number).toBe('111');
    expect(body.description).toBe('A lovely property');
    expect(body.status).toBe('APPROVED');

    // Verify GetItem was called with correct keys
    const getInput = ddbMock.call(0).args[0].input as any;
    expect(getInput.Key).toEqual({
      PK: { S: 'PROPERTY#usa#anytown' },
      SK: { S: 'main-street#111' },
    });
  });

  it('should return 404 when property not found', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: undefined,
      $metadata: { httpStatusCode: 200 },
    });

    const event = createAPIGatewayProxyEvent({
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/usa/anytown/main-street/999',
      pathParameters: {
        country: 'usa',
        city: 'anytown',
        street: 'main-street',
        number: '999',
      },
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('No property for');
  });

  it('should return 404 when property not APPROVED', async () => {
    ddbMock.on(GetItemCommand).resolves({
      Item: marshall(PENDING_PROPERTY),
      $metadata: { httpStatusCode: 200 },
    });

    const event = createAPIGatewayProxyEvent({
      resource: '/properties/{country}/{city}/{street}/{number}',
      path: '/properties/usa/anytown/main-street/111',
      pathParameters: {
        country: 'usa',
        city: 'anytown',
        street: 'main-street',
        number: '111',
      },
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('No property for');
  });

  it('should return 400 for non-GET method', async () => {
    const event = createAPIGatewayProxyEvent({
      resource: '/unknown-resource',
      path: '/unknown-resource',
      httpMethod: 'GET',
    });

    const result = await lambdaHandler(event, mockContext);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('Unable to handle resource');
  });
});
