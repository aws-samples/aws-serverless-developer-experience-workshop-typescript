import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  CloudFormationClient,
  DescribeStacksCommand,
  DescribeStacksCommandOutput,
} from "@aws-sdk/client-cloudformation";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import {
  CloudWatchLogs,
  DescribeLogStreamsCommand,
  GetLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import PropertyData from "../../data/property_data.json";

export const sleep = async (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export async function* getCloudWatchLogsValues(
  propertyId: string,
): AsyncGenerator<any, void, unknown> {
  const groupName = await findOutputValue("UnicornWebCatchAllLogGroupName");

  // Initialize the CloudWatch Logs client
  const cwl = new CloudWatchLogs({ region: process.env.AWS_DEFAULT_REGION });

  // Get the CW LogStream with the latest log messages
  const streamResponse = await cwl.send(
    new DescribeLogStreamsCommand({
      logGroupName: groupName,
      orderBy: "LastEventTime",
      descending: true,
      limit: 3,
    }),
  );

  const latestLogStreamNames = (streamResponse.logStreams || []).map(
    (s) => s.logStreamName || "",
  );

  // Fetch log events from that stream
  const responses = await Promise.all(
    latestLogStreamNames.map(async (name) => {
      return await cwl.send(
        new GetLogEventsCommand({
          logGroupName: groupName,
          logStreamName: name,
        }),
      );
    }),
  );

  // Filter log events that match the required `propertyId`
  for (const response of responses) {
    for (const event of response.events || []) {
      const ev = JSON.parse(event.message || "{}");
      if (ev.detail?.property_id === propertyId) {
        yield ev;
      }
    }
  }
}

export async function clearDatabase() {
  const client = new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION });
  const tableName = await findOutputValue("WebTableName");

  const scanCommand = new ScanCommand({ TableName: tableName });
  try {
    const scanResponse = await client.send(scanCommand);
    const itemsToDelete = scanResponse.Items;

    if (!itemsToDelete || itemsToDelete.length === 0) {
      console.log("No items to delete.");
      return;
    }

    // Create an array of DeleteRequest objects for batch delete
    const deleteRequests: BatchWriteCommandInput = {
      RequestItems: {
        [tableName]: itemsToDelete.map((item: any) => ({
          DeleteRequest: {
            Key: {
              PK: item.PK,
              SK: item.SK,
            },
          },
        })),
      },
    };

    const batchWriteCommand = new BatchWriteCommand(deleteRequests);

    // Execute the batch write command to delete all items
    try {
      const batchWriteResponse = await client.send(batchWriteCommand);
    } catch (error) {
      console.error("Error batch deleting items:", error);
    }
  } catch (error) {
    console.error("Error scanning table:", error);
  }
}

export const initialiseDatabase = async () => {
  const tableName = await findOutputValue("WebTableName");
  const client = new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION });
  const docClient = DynamoDBDocumentClient.from(client);
  const command = new BatchWriteCommand({
    RequestItems: {
      [tableName]: PropertyData.map((property) => ({
        PutRequest: { Item: property },
      })),
    },
  });
  return await docClient.send(command);
};

export const findOutputValue = async (outputKey: string) => {
  const cloudformation = new CloudFormationClient({
    region: process.env.AWS_DEFAULT_REGION,
  });
  const stackResources: DescribeStacksCommandOutput = await cloudformation.send(
    new DescribeStacksCommand({ StackName: "uni-prop-local-web" }),
  );
  if (stackResources.Stacks === undefined || stackResources.Stacks?.length < 1)
    throw new Error(
      "Could not find stack resources named: uni-prop-local-web ",
    );

  if (
    stackResources.Stacks[0].Outputs === undefined ||
    stackResources.Stacks[0].Outputs?.length < 1
  ) {
    throw new Error(
      "Could not find stack outputs for stack named: uni-prop-local-web",
    );
  }

  const outputValue = stackResources.Stacks[0].Outputs.find(
    (output) => output.OutputKey === outputKey,
  )?.OutputValue;
  if (outputValue === undefined)
    throw new Error(`Could not find stack output named: ${outputKey}`);
  return outputValue;
};
