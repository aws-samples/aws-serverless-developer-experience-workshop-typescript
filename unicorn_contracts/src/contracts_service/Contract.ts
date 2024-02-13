// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Defines the structure of a contract in the database.
 *
 * @property address - The address of the contract.
 * @property property_id - The ID of the property associated with the contract.
 * @property contract_id - The ID of the contract.
 * @property seller_name - The name of the seller.
 * @property contract_status - The status of the contract.
 * @property contract_created - The date the contract was created.
 * @property contract_last_modified_on - The date the contract was last modified.
 */
export type ContractDBType = {
  address?: string;
  property_id: string;
  contract_id?: string;
  seller_name?: string;
  contract_status: ContractStatusEnum;
  contract_created?: string;
  contract_last_modified_on?: string;
};

/**
 * Enumerates the possible status values for a contract.
 *
 * @enum {string}
 * @property APPROVED - The contract has been approved.
 * @property CANCELLED - The contract has been cancelled.
 * @property DRAFT - The contract is in draft status.
 * @property CLOSED - The contract has been closed.
 * @property EXPIRED - The contract has expired.
 */
export enum ContractStatusEnum {
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT",
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED",
}

/**
 * Defines an interface for a contract error that extends the base Error interface.
 *
 * @interface ContractError
 * @extends Error
 * @property propertyId - The ID of the property associated with the error.
 * @property object - The object associated with the error (optional).
 */
export interface ContractError extends Error {
  propertyId: string;
  object?: any;
}

/**
 * Defines an interface for a contract response.
 *
 * @interface ContractResponse
 * @property propertyId - The ID of the property associated with the response.
 * @property metadata - Additional metadata associated with the response.
 */
export interface ContractResponse {
  propertyId: string;
  metadata: any;
}
