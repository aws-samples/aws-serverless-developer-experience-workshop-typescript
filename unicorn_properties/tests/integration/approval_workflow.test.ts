// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
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
import {
  SFNClient,
  ListExecutionsCommand,
  GetExecutionHistoryCommand,
} from '@aws-sdk/client-sfn';

import ContractStatusChangedDraftEvent from '../events/eventbridge/contract_status_changed_event_contract_1_draft.json';
import PublicationApprovalNonExistingContractEvent from '../events/eventbridge/publication_approval_requested_event_non_existing_contract.json';
import PublicationApprovalInappropriateDescriptionEvent from '../events/eventbridge/publication_approval_requested_event_inappropriate_description.json';
import PublicationApprovalInappropriateImagesEvent from '../events/eventbridge/publication_approval_requested_event_inappropriate_images.json';

describe('Tests that failed workflow', () => {
  beforeAll(async () => {
    await clearDatabase();
    await initializeDatabase();

    // Create a draft contract
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    await evb.send(
      new PutEventsCommand({ Entries: ContractStatusChangedDraftEvent })
    );
    await sleep(5000);
  }, 30000);

  afterAll(async () => {
    await clearDatabase();
  }, 30000);

  it('Fails if the contract does not exist', async () => {
    // Arrange
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

    // Act
    await evb.send(
      new PutEventsCommand({
        Entries: PublicationApprovalNonExistingContractEvent,
      })
    );
    await sleep(5000);
    // Assert
    const listExecutionsCommand = new ListExecutionsCommand({
      stateMachineArn: await findOutputValue(
        'uni-prop-local-properties-approval',
        'ApprovalStateMachineArn'
      ),
      statusFilter: 'FAILED',
    });
    const sfnResp = await sfn.send(listExecutionsCommand);

    if (sfnResp.executions) {
      const getExecutionHistory = new GetExecutionHistoryCommand({
        executionArn: sfnResp.executions[0].executionArn,
      });
      const sfnHistory = await sfn.send(getExecutionHistory);
      // filter through sfnHistory looking for an event with "type": "FailStateEntered" and stateEnteredEventDetails.name set to "NotFound"
      const failStateEvent = sfnHistory.events?.find(
        (event: any) =>
          event.type === 'FailStateEntered' &&
          event.stateEnteredEventDetails?.name === 'NotFound'
      );

      expect(failStateEvent).toBeTruthy();
      expect(failStateEvent?.type).toBe('FailStateEntered');
      expect(failStateEvent?.stateEnteredEventDetails?.name).toBe('NotFound');
    } else {
      throw new Error('No executions found');
    }
  }, 20000);

  it('Flags content moderation for inappropriate description', async () => {
    // Arrange
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

    // Act
    await evb.send(
      new PutEventsCommand({
        Entries: PublicationApprovalInappropriateDescriptionEvent,
      })
    );
    await sleep(5000);
    // Assert
    const listExecutionsCommand = new ListExecutionsCommand({
      stateMachineArn: await findOutputValue(
        'uni-prop-local-properties-approval',
        'ApprovalStateMachineArn'
      ),
      statusFilter: 'SUCCEEDED',
    });
    const sfnResp = await sfn.send(listExecutionsCommand);

    if (sfnResp.executions) {
      const getExecutionHistory = new GetExecutionHistoryCommand({
        executionArn: sfnResp.executions[0].executionArn,
      });
      const sfnHistory = await sfn.send(getExecutionHistory);
      const failStateEvent = sfnHistory.events?.find(
        (event: any) =>
          event.type === 'SucceedStateEntered' &&
          event.stateEnteredEventDetails?.name === 'Declined'
      );

      expect(failStateEvent).toBeTruthy();
      expect(failStateEvent?.type).toBe('SucceedStateEntered');
      expect(failStateEvent?.stateEnteredEventDetails?.name).toBe('Declined');
    } else {
      throw new Error('No executions found');
    }
  }, 20000);

  it('Flags content moderation for inappropriate images', async () => {
    // Arrange
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

    // Act
    await evb.send(
      new PutEventsCommand({
        Entries: PublicationApprovalInappropriateImagesEvent,
      })
    );
    await sleep(5000);
    // Assert
    const listExecutionsCommand = new ListExecutionsCommand({
      stateMachineArn: await findOutputValue(
        'uni-prop-local-properties-approval',
        'ApprovalStateMachineArn'
      ),
      statusFilter: 'SUCCEEDED',
    });
    const sfnResp = await sfn.send(listExecutionsCommand);

    if (sfnResp.executions) {
      const getExecutionHistory = new GetExecutionHistoryCommand({
        executionArn: sfnResp.executions[0].executionArn,
      });
      const sfnHistory = await sfn.send(getExecutionHistory);
      const failStateEvent = sfnHistory.events?.find(
        (event: any) =>
          event.type === 'SucceedStateEntered' &&
          event.stateEnteredEventDetails?.name === 'Declined'
      );

      expect(failStateEvent).toBeTruthy();
      expect(failStateEvent?.type).toBe('SucceedStateEntered');
      expect(failStateEvent?.stateEnteredEventDetails?.name).toBe('Declined');
    } else {
      throw new Error('No executions found');
    }
  }, 20000);
});
