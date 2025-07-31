// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import {
  sleep,
  findOutputValue,
  clearDatabase,
  initializeDatabase,
} from './helper';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

import ContractStatusChangedDraftEvent from '../events/eventbridge/contract_status_changed_event_contract_1_draft.json';
import ContractApprovedEvent from '../events/eventbridge/contract_status_changed_event_contract_2_approved.json';

describe('Testing draft contract event handling', () => {
  beforeAll(async () => {
    await clearDatabase();
    await initializeDatabase();
  }, 30000);

  afterAll(async () => {
    await clearDatabase();
  }, 30000);

  it('Should create a draft contract', async () => {
    // Arrange
    const ddb = new DynamoDBClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const contractStatusTableName = await findOutputValue(
      'uni-prop-local-approvals',
      'ContractStatusTableName'
    );

    // Act
    await evb.send(
      new PutEventsCommand({ Entries: ContractStatusChangedDraftEvent })
    );
    await sleep(10000);
    // Assert
    const getItemCommand = new GetItemCommand({
      TableName: contractStatusTableName,
      Key: { property_id: { S: 'usa/anytown/main-street/111' } },
    });
    const ddbResp = await ddb.send(getItemCommand);
    expect(ddbResp?.Item).toBeTruthy();
    if (!ddbResp?.Item) throw Error('Contract not found');
    expect(ddbResp.Item.contract_status?.S).toBe('DRAFT');
    expect(ddbResp.Item.sfn_wait_approved_task_token).toBe(undefined);
  }, 30000);

  it('Should update an existing contract status to APPROVED', async () => {
    // Arrange
    const ddb = new DynamoDBClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const contractStatusTableName = await findOutputValue(
      'uni-prop-local-approvals',
      'ContractStatusTableName'
    );

    // Act
    await evb.send(new PutEventsCommand({ Entries: ContractApprovedEvent }));
    await sleep(5000);

    // Assert
    const getItemCommand = new GetItemCommand({
      TableName: contractStatusTableName,
      Key: { property_id: { S: 'usa/anytown/main-street/222' } },
    });
    const ddbResp = await ddb.send(getItemCommand);
    expect(ddbResp?.Item).toBeTruthy();
    if (!ddbResp.Item) throw new Error('Contract not found');
    expect(ddbResp.Item.contract_status?.S).toBe('APPROVED');
  }, 30000);
});