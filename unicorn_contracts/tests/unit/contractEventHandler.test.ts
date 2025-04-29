// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { lambdaHandler } from '../../src/contracts_service/contractEventHandler';
import { mockClient } from 'aws-sdk-client-mock';

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
  /* eslint-disable @typescript-eslint/no-empty-function */
};

const defaultSQSRecord: SQSRecord = {
  messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
  receiptHandle: 'MessageReceiptHandle',
  body: '', // This will be populated in the specific tests
  attributes: {
    ApproximateReceiveCount: '1',
    SentTimestamp: '1672531200000', // example timestamp
    SenderId: 'XXXXXXXXXXXXXXXXXXXXX',
    ApproximateFirstReceiveTimestamp: '1672531200001',
  },
  messageAttributes: {}, // This will be populated in the specific tests
  md5OfBody: 'e4e68fb7bd0e697a0ae8f1bb342846b3',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
  awsRegion: 'us-east-1',
};

describe('ContractEventHandlerFunction', () => {
  // Input Validation Tests
  describe('parseRecord', () => {
    it('should throw error when SQS message body is invalid JSON', async () => {
      const sqsEvent: SQSEvent = {
        Records: [
          {
            ...defaultSQSRecord,
            body: 'invalid json',
            messageAttributes: {
              HttpMethod: {
                stringValue: 'POST',
                dataType: 'String',
              },
            },
          },
        ],
      };

      await expect(lambdaHandler(sqsEvent, mockContext)).rejects.toThrow(
        'Error parsing SQS Record'
      );
    });
  });

  // Contract Creation Tests
  describe('createContract', () => {
    it('should generate unique contract_id for new contracts', async () => {
      ddbMock
        .on(PutItemCommand)
        .resolves({ $metadata: { httpStatusCode: 200 } });

      const sqsEvent = createSQSEvent('POST', {
        property_id: '123',
        address: '123 Main St',
        seller_name: 'John Doe',
      });

      await lambdaHandler(sqsEvent, mockContext);

      const putCall = ddbMock.call(0);
      expect(putCall.args[0].input).toHaveProperty('Item.contract_id');
      expect((putCall.args[0].input as any).Item.contract_id.S).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      // console.log('PutCall structure:', JSON.stringify(putCall.args[0], null, 2));
    });

    it('should set correct timestamps for new contracts', async () => {
      ddbMock
        .on(PutItemCommand)
        .resolves({ $metadata: { httpStatusCode: 200 } });

      const sqsEvent = createSQSEvent('POST', {
        property_id: '123',
        address: '123 Main St',
        seller_name: 'John Doe',
      });

      await lambdaHandler(sqsEvent, mockContext);

      const putCall = ddbMock.call(0);
      expect(putCall.args[0].input).toHaveProperty('Item.contract_created');
    });
  });

  // Multiple Record Handling
  describe('multiple records', () => {
    beforeEach(() => {
      ddbMock.reset();
    });

    it('should process multiple records in the SQS event', async () => {
      ddbMock
        .on(PutItemCommand)
        .resolves({ $metadata: { httpStatusCode: 200 } });

      const sqsEvent: SQSEvent = {
        Records: [
          createSQSRecord('POST', { property_id: '123' }),
          createSQSRecord('POST', { property_id: '456' }),
        ],
      };

      await lambdaHandler(sqsEvent, mockContext);

      expect(ddbMock.calls()).toHaveLength(2);
    });
  });
});

// Helper functions
function createSQSEvent(httpMethod: string, body: any): SQSEvent {
  return {
    Records: [createSQSRecord(httpMethod, body)],
  };
}

function createSQSRecord(httpMethod: string, body: any): SQSRecord {
  return {
    messageId: '1',
    receiptHandle: 'handle',
    body: JSON.stringify(body),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1',
      SenderId: 'SENDER',
      ApproximateFirstReceiveTimestamp: '1',
    },
    messageAttributes: {
      HttpMethod: {
        stringValue: httpMethod,
        dataType: 'String',
      },
    },
    md5OfBody: 'test',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs',
    awsRegion: 'us-east-1',
  };
}
