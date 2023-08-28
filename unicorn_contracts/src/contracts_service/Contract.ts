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
  ScanCommand,
  ScanCommandInput
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { logger } from "./powertools";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;


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
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
  DRAFT = 'DRAFT',
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED"
}

export interface ContractError extends Error {
  propertyId: string;
  object?: any;
}

export interface ContractResponse {
  propertyId: string;
  metadata: any;
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
