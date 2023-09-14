// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
  PutEventsCommandOutput,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

// Empty configuration for EventBridge
const eventsClient = new EventBridgeClient({});
const EVENT_BUS = process.env.EVENT_BUS;

// Internal data model
const fields: string[] = ["address", "property_id", "seller_name"];

// External data types
export const ContractCreatedMetric: string = "ContractCreated";
export const ContractUpdatedMetric: string = "ContractUpdated";
export const ContractEventMetric: string = "ContractEvent";

export type ContractStatusChangedEvent = {
  contract_last_modified_on: string;
  contract_id: string;
  property_id: string;
  contract_status: ContractStatusEnum;
};

export type ContractDBType = {
  address?: string;
  property_id: string;
  contract_id?: string;
  seller_name?: string;
  contract_status: ContractStatusEnum;
  contract_created?: string;
  contract_last_modified_on?: string;
};

export enum ContractStatusEnum {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED",
}

export interface ContractError extends Error {
  propertyId: string;
  object?: any;
}

export interface ContractResponse {
  propertyId: string;
  metadata: any;
}

export function validData(data: any): boolean {
  for (let i = 0; i < fields.length; i++) {
    let field = fields[i];
    if (!(field in data)) {
      return false;
    }
  }
  return true;
}

export async function getContractFor(
  propertyId: string
): Promise<ContractDBType | undefined> {
  const getItemCommandInput: GetItemCommandInput = {
    Key: { property_id: { S: propertyId } },
    ProjectionExpression:
      "contract_id, property_id, contract_status, address, seller_name, contract_created, contract_last_modified_on",
    TableName: DDB_TABLE,
  };

  const data = await ddbClient.send(new GetItemCommand(getItemCommandInput));
  if (data.Item === undefined) {
    return undefined;
  } else {
    const result: ContractDBType = unmarshall(data.Item) as ContractDBType;
    return result;
  }
}

export async function updateEntryInDB(
  dbEntry: ContractDBType
): Promise<ContractResponse> {
  // Build the Command objects
  const ddbUpdateCommandInput: UpdateItemCommandInput = {
    TableName: DDB_TABLE,
    Key: { property_id: { S: dbEntry.property_id } },
    UpdateExpression: "set contract_status = :t, modified_date = :m",
    ExpressionAttributeValues: {
      ":t": { S: dbEntry.contract_status as string },
      ":m": { S: dbEntry.contract_last_modified_on as string },
    },
  };
  const ddbUpdateCommand = new UpdateItemCommand(ddbUpdateCommandInput);

  // Send the command
  const ddbUpdateCommandOutput: UpdateItemCommandOutput = await ddbClient.send(
    ddbUpdateCommand
  );
  if (ddbUpdateCommandOutput.$metadata.httpStatusCode != 200) {
    const error: ContractError = {
      propertyId: dbEntry.property_id,
      name: "ContractDBUpdateError",
      message:
        "Response error code: " +
        ddbUpdateCommandOutput.$metadata.httpStatusCode,
      object: ddbUpdateCommandOutput.$metadata,
    };
    throw error;
  }

  const response: ContractResponse = {
    propertyId: dbEntry.property_id,
    metadata: ddbUpdateCommandOutput.$metadata,
  };
  return response;
}

export async function saveEntryToDB(
  dbEntry: ContractDBType
): Promise<ContractResponse> {
  // Build the Command objects
  const ddbPutCommandInput: PutItemCommandInput = {
    TableName: DDB_TABLE,
    Item: marshall(dbEntry, { removeUndefinedValues: true }),
  };
  const ddbPutCommand = new PutItemCommand(ddbPutCommandInput);

  // Send the command
  const ddbPutCommandOutput: PutItemCommandOutput = await ddbClient.send(
    ddbPutCommand
  );
  if (ddbPutCommandOutput.$metadata.httpStatusCode != 200) {
    let error: ContractError = {
      propertyId: dbEntry.property_id,
      name: "ContractDBSaveError",
      message:
        "Response error code: " + ddbPutCommandOutput.$metadata.httpStatusCode,
      object: ddbPutCommandOutput.$metadata,
    };
    throw error;
  }

  let response: ContractResponse = {
    propertyId: dbEntry.property_id,
    metadata: ddbPutCommandOutput.$metadata,
  };
  return response;
}

export async function fireContractEvent(
  eventDetail: ContractStatusChangedEvent,
  source: string,
  detailType: string
): Promise<ContractResponse> {
  const propertyId = eventDetail.property_id;

  // Build the Command objects
  const eventsPutEventsCommandInputEntry: PutEventsRequestEntry = {
    EventBusName: EVENT_BUS,
    Time: new Date(),
    Source: source,
    DetailType: detailType,
    Detail: JSON.stringify(eventDetail),
  };
  const eventsPutEventsCommandInput: PutEventsCommandInput = {
    Entries: [eventsPutEventsCommandInputEntry],
  };
  const eventsPutEventsCommand = new PutEventsCommand(
    eventsPutEventsCommandInput
  );

  // Send the command
  const eventsPutEventsCommandOutput: PutEventsCommandOutput =
    await eventsClient.send(eventsPutEventsCommand);

  if (eventsPutEventsCommandOutput.$metadata.httpStatusCode != 200) {
    let error: ContractError = {
      propertyId: propertyId,
      name: "ContractEventsError",
      message:
        "Response invalid: " +
        eventsPutEventsCommandOutput.$metadata.httpStatusCode,
      object: eventsPutEventsCommandOutput.$metadata,
    };
    throw error;
  }
  let response: ContractResponse = {
    propertyId: propertyId,
    metadata: eventsPutEventsCommandOutput.$metadata,
  };
  return response;
}
