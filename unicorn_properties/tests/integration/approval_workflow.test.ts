// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { sleep, findOutputValue } from './helper';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import {
  SFNClient,
  ListExecutionsCommand,
  GetExecutionHistoryCommand,
} from '@aws-sdk/client-sfn';

import PublicationApprovalNonExistingContractEvent from '../events/eventbridge/publication_approval_requested_event_non_existing_contract.json';
import PublicationApprovalInappropriateDescriptionEvent from '../events/eventbridge/publication_approval_requested_event_inappropriate_description.json';
import PublicationApprovalInappropriateImagesEvent from '../events/eventbridge/publication_approval_requested_event_inappropriate_images.json';
// import PublicationApprovalPausedEvent from '../events/eventbridge/publication_approval_requested_event_pause_workflow.json';
// import PublicationApprovalAllApprovedEvent from '../events/eventbridge/publication_approval_requested_event_all_good.json';
// import ContractApprovedEvent from '../events/eventbridge/contract_status_changed_event_contract_1_approved.json';

describe('Tests that failed workflow', () => {
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

// describe('Tests paused workflow phase 1', () => {
//   it('pauses if the contract is not approved', async () => {
//     // Arrange
//     const evb = new EventBridgeClient({
//       region: process.env.AWS_DEFAULT_REGION,
//     });
//     const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

//     // Act
//     await evb.send(
//       new PutEventsCommand({ Entries: PublicationApprovalPausedEvent })
//     );
//     await sleep(15000);
//     // Assert
//     const listExecutionsCommand = new ListExecutionsCommand({
//       stateMachineArn: await findOutputValue('uni-prop-local-properties-approval', 'ApprovalStateMachineArn'),
//       statusFilter: 'RUNNING',
//     });
//     const sfnResp = await sfn.send(listExecutionsCommand);

//     if (sfnResp.executions) {
//       const getExecutionHistory = new GetExecutionHistoryCommand({
//         executionArn: sfnResp.executions[0].executionArn,
//       });
//       const sfnHistory = await sfn.send(getExecutionHistory);
//       const failStateEvent = sfnHistory.events?.find(
//         (event: any) =>
//           event.type === 'TaskStateEntered' &&
//           event.stateEnteredEventDetails?.name === 'WaitForContractApproval'
//       );

//       expect(failStateEvent).toBeTruthy();
//       expect(failStateEvent?.type).toBe('TaskStateEntered');
//       expect(failStateEvent?.stateEnteredEventDetails?.name).toBe(
//         'WaitForContractApproval'
//       );
//     } else {
//       throw new Error('No executions found');
//     }
//   }, 20000);
// });

// describe('Tests paused workflow phase 2', () => {
//   it('resumes workflow once approved', async () => {
//     // Arrange
//     const evb = new EventBridgeClient({
//       region: process.env.AWS_DEFAULT_REGION,
//     });
//     const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

//     // Act
//     await evb.send(new PutEventsCommand({ Entries: ContractApprovedEvent }));
//     await sleep(15000);
//     // Assert
//     const listExecutionsCommand = new ListExecutionsCommand({
//       stateMachineArn: await findOutputValue('uni-prop-local-properties-approval', 'ApprovalStateMachineArn'),
//       statusFilter: 'SUCCEEDED',
//     });
//     const sfnResp = await sfn.send(listExecutionsCommand);

//     if (sfnResp.executions) {
//       const getExecutionHistory = new GetExecutionHistoryCommand({
//         executionArn: sfnResp.executions[0].executionArn,
//       });
//       const sfnHistory = await sfn.send(getExecutionHistory);
//       const failStateEvent = sfnHistory.events?.find(
//         (event: any) =>
//           event.type === 'SucceedStateExited' &&
//           event.stateExitedEventDetails?.name === 'Approved'
//       );

//       expect(failStateEvent).toBeTruthy();
//       expect(failStateEvent?.type).toBe('SucceedStateExited');
//       expect(failStateEvent?.stateExitedEventDetails?.name).toBe('Approved');
//     } else {
//       throw new Error('No executions found');
//     }
//   }, 20000);
// });

// describe('Tests that successful workflow', () => {
//   it('fully completes if already approved.', async () => {
//     // Arrange
//     const evb = new EventBridgeClient({
//       region: process.env.AWS_DEFAULT_REGION,
//     });
//     const sfn = new SFNClient({ region: process.env.AWS_DEFAULT_REGION });

//     // Act
//     await evb.send(
//       new PutEventsCommand({
//         Entries: PublicationApprovalAllApprovedEvent,
//       })
//     );
//     await sleep(15000);
//     // Assert
//     const listExecutionsCommand = new ListExecutionsCommand({
//       stateMachineArn: await findOutputValue('uni-prop-local-properties-approval', 'ApprovalStateMachineArn'),
//       statusFilter: 'SUCCEEDED',
//     });
//     const sfnResp = await sfn.send(listExecutionsCommand);

//     if (sfnResp.executions) {
//       const getExecutionHistory = new GetExecutionHistoryCommand({
//         executionArn: sfnResp.executions[0].executionArn,
//       });
//       const sfnHistory = await sfn.send(getExecutionHistory);
//       const failStateEvent = sfnHistory.events?.find(
//         (event: any) =>
//           event.type === 'SucceedStateExited' &&
//           event.stateExitedEventDetails?.name === 'Approved'
//       );

//       expect(failStateEvent).toBeTruthy();
//       expect(failStateEvent?.type).toBe('SucceedStateExited');
//       expect(failStateEvent?.stateExitedEventDetails?.name).toBe('Approved');
//     } else {
//       throw new Error('No executions found');
//     }
//   }, 20000);
// });
