// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

// External data types
export const ContractCreatedMetric: string = "ContractCreated";
export const ContractUpdatedMetric: string = "ContractUpdated";


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

export async function getContractsFor(
  propertyId: string
): Promise<Array<ContractDBType>> {

  const getItemCommandInput: QueryCommandInput = {
    ExpressionAttributeValues: {
      ':property_id' : {S: propertyId}
    },
    ProjectionExpression:
      "contract_id, property_id, contract_status, address, seller_name, contract_created, contract_last_modified_on",
    TableName: DDB_TABLE,
  };

  const data: QueryCommandOutput = await ddbClient.send(new QueryCommand(getItemCommandInput));
  if (!data?.Items) {
    return [];
  } 
  const contracts = data.Items.map(record => unmarshall(record) as ContractDBType);
  return contracts;
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
