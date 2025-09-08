// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {
  BatchWriteCommand,
  ScanCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  CloudWatchLogs,
  DescribeLogStreamsCommand,
  GetLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function* getCloudWatchLogsValues(
  propertyId: string
): AsyncGenerator<any, void, unknown> {
  const groupArn = await findOutputValue(
    'uni-prop-local-approvals',
    'UnicornApprovalsCatchAllLogGroupArn'
  );

  // Initialize the CloudWatch Logs client
  const region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'ap-southeast-2';
  const cwl = new CloudWatchLogs({ region });

  // Get the CW LogStream with the latest log messages
  const streamResponse = await cwl.send(
    new DescribeLogStreamsCommand({
      logGroupIdentifier: groupArn,
      orderBy: 'LastEventTime',
      descending: true,
      limit: 3,
    })
  );

  const latestLogStreamNames = (streamResponse.logStreams || []).map(
    (s) => s.logStreamName || ''
  );

  // Fetch log events from that stream
  const responses = await Promise.all(
    latestLogStreamNames.map(async (name) => {
      return await cwl.send(
        new GetLogEventsCommand({
          logGroupIdentifier: groupArn,
          logStreamName: name,
        })
      );
    })
  );

  // Filter log events that match the required `propertyId`
  for (const response of responses) {
    for (const event of response.events || []) {
      const ev = JSON.parse(event.message || '{}');
      if (ev.detail?.property_id === propertyId) {
        yield ev;
      }
    }
  }
}

export async function clearDatabase() {
  const client = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION,
  });
  const tableName = await findOutputValue(
    'uni-prop-local-properties',
    'ContractStatusTableName'
  );

  const scanCommand = new ScanCommand({ TableName: tableName });
  let itemsToDelete;
  try {
    const scanResponse = await client.send(scanCommand);
    itemsToDelete = scanResponse.Items;
  } catch (error) {
    console.error('Error scanning table:', error);
  }

  if (!itemsToDelete || itemsToDelete.length === 0) {
    console.log('No items to delete.');
    return;
  }

  // Create an array of DeleteRequest objects for batch delete
  const batchWriteCommand = new BatchWriteCommand({
    RequestItems: {
      [tableName]: itemsToDelete.map((item: any) => ({
        DeleteRequest: {
          Key: {
            property_id: item.property_id,
          },
        },
      })),
    },
  });

  // Execute the batch write command to delete all items
  try {
    await client.send(batchWriteCommand);
  } catch (error) {
    console.error('Error batch deleting items:', error);
  }
}

export async function initializeDatabase() {
  const client = new DynamoDBClient({
    region: process.env.AWS_DEFAULT_REGION,
  });
  const tableName = await findOutputValue(
    'uni-prop-local-properties',
    'ContractStatusTableName'
  );

  const putItemRequest: PutCommandInput = {
    TableName: tableName,
    Item: {
      contract_last_modified_on: { S: '10/08/2022 19:56:30' },
      contract_id: { S: '9183453b-d284-4466-a2d9-f00b1d569ad7' },
      property_id: { S: 'usa/anytown/main-street/444' },
      contract_status: { S: 'DRAFT' },
    },
  };
  const putItemCommand = new PutItemCommand(putItemRequest);
  // Execute the batch write command to delete all items
  try {
    await client.send(putItemCommand);
  } catch (error) {
    console.error('Error initialising database:', error);
  }
}

export const findOutputValue = async (StackName: string, outputKey: string): Promise<string> => {
  const region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'ap-southeast-2';
  const cloudformation = new CloudFormationClient({ region });
  
  const stackResources = await cloudformation.send(
    new DescribeStacksCommand({ StackName })
  );
  
  const output = stackResources.Stacks?.[0]?.Outputs?.find(
    (output) => output.OutputKey === outputKey
  );
  
  if (!output?.OutputValue) {
    throw new Error(`Could not find output ${outputKey} in stack ${StackName}`);
  }
  
  return output.OutputValue;
};
