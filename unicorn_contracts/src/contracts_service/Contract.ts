// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

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


