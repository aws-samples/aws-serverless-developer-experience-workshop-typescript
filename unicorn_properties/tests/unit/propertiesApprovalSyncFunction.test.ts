// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, DynamoDBBatchResponse } from "aws-lambda";
import { randomUUID } from "crypto";
import { lambdaHandler } from "../../src/properties_service/propertiesApprovalSyncFunction";
import { mockClient } from "aws-sdk-client-mock";
import { SendTaskSuccessCommandInput, SFNClient } from "@aws-sdk/client-sfn";

describe("Unit tests for contract creation", function () {
  const sfnMock = mockClient(SFNClient);

  const baselineDynamoDBEvent = {
    Records: [
      {
        eventID: "eventID1",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "ap-southeast-2",
        dynamodb: {
          ApproximateCreationDateTime: 1660484629,
          Keys: {
            property_id: {
              S: "PROPERTY/australia#sydney/high#23",
            },
          },
          NewImage: {
            sfn_wait_approved_task_token: {
              S: "taskToken1",
            },
            contract_status: {
              S: "APPROVED",
            },
            contract_id: {
              S: "contractId1",
            },
            property_id: {
              S: "PROPERTY/australia#sydney/high#23",
            },
          },
          OldImage: {
            sfn_wait_approved_task_token: {
              S: "taskToken0",
            },
            contract_status: {
              S: "DRAFT",
            },
            contract_id: {
              S: "contractId1",
            },
            property_id: {
              S: "PROPERTY/australia#sydney/high#23",
            },
          },
          SequenceNumber: "17970100000000005135132811",
          SizeBytes: 825,
        },
        eventSourceARN: "contractStatusTableARN",
      },
    ],
  };

  beforeEach(() => {
    sfnMock.reset();
  });

  test("verifies Approved check", async () => {
    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      const taskToken = cmd.taskToken;
      expect(taskToken).toEqual("taskToken1");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      baselineDynamoDBEvent,
      context,
    );
    expect(response.batchItemFailures.length).toEqual(0);
  });

  test("verifies Unapproved check", async () => {
    baselineDynamoDBEvent.Records[0].dynamodb.NewImage.contract_status.S =
      "New";

    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      const taskToken = cmd.taskToken;
      fail("Unexpected call to SFN");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      baselineDynamoDBEvent,
      context,
    );
    // Expect no errors.
    expect(response.batchItemFailures.length).toEqual(0);
  });

  test("verifies non-status update check", async () => {
    baselineDynamoDBEvent.Records[0].dynamodb.OldImage.contract_id.S =
      "oldcontract1";
    baselineDynamoDBEvent.Records[0].dynamodb.NewImage.contract_status.S =
      "Draft";

    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      fail("Unexpected call to SFN");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      baselineDynamoDBEvent,
      context,
    );
    // Expect no errors.
    expect(response.batchItemFailures.length).toEqual(0);
  });

  test("verifies no task token check", async () => {
    const noTaskTokenEvent = {
      Records: [
        {
          eventID: "eventID1",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "ap-southeast-2",
          dynamodb: {
            ApproximateCreationDateTime: 1660484629,
            Keys: {
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            NewImage: {
              contract_status: {
                S: "Approved",
              },
              contract_id: {
                S: "contractId1",
              },
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            SequenceNumber: "17970100000000005135132811",
            SizeBytes: 825,
          },
          eventSourceARN: "contractStatusTableARN",
        },
      ],
    };

    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      const taskToken = cmd.taskToken;
      fail("Unexpected call to SFN");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      noTaskTokenEvent,
      context,
    );
    // Expect no errors.
    expect(response.batchItemFailures.length).toEqual(0);
  });

  test("verifies approved record update", async () => {
    const noTaskTokenEvent = {
      Records: [
        {
          eventID: "eventID1",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "ap-southeast-2",
          dynamodb: {
            ApproximateCreationDateTime: 1660484629,
            Keys: {
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            NewImage: {
              sfn_wait_approved_task_token: {
                S: "taskToken1",
              },
              contract_status: {
                S: "APPROVED",
              },
              contract_id: {
                S: "contractId1",
              },
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            OldImage: {
              contract_status: {
                S: "APPROVED",
              },
              contract_id: {
                S: "contractId1",
              },
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            SequenceNumber: "17970100000000005135132811",
            SizeBytes: 825,
          },
          eventSourceARN: "contractStatusTableARN",
        },
      ],
    };

    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      const taskToken = cmd.taskToken;
      expect(taskToken).toEqual("taskToken1");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      noTaskTokenEvent,
      context,
    );
    // Expect no errors.
    expect(response.batchItemFailures.length).toEqual(0);
  });

  test("verifies approved record update with an old task token", async () => {
    const noTaskTokenEvent = {
      Records: [
        {
          eventID: "eventID1",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "ap-southeast-2",
          dynamodb: {
            ApproximateCreationDateTime: 1660484629,
            Keys: {
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            NewImage: {
              sfn_wait_approved_task_token: {
                S: "taskToken1",
              },
              contract_status: {
                S: "APPROVED",
              },
              contract_id: {
                S: "contractId1",
              },
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            OldImage: {
              sfn_wait_approved_task_token: {
                S: "taskToken0",
              },
              contract_status: {
                S: "APPROVED",
              },
              contract_id: {
                S: "contractId1",
              },
              property_id: {
                S: "PROPERTY/australia#sydney/high#23",
              },
            },
            SequenceNumber: "17970100000000005135132811",
            SizeBytes: 825,
          },
          eventSourceARN: "contractStatusTableARN",
        },
      ],
    };

    function verifyTaskSend(input: any) {
      const cmd = input as SendTaskSuccessCommandInput;
      const taskToken = cmd.taskToken;
      expect(taskToken).toEqual("taskToken1");
    }

    sfnMock.callsFake(verifyTaskSend);

    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response: DynamoDBBatchResponse = await lambdaHandler(
      noTaskTokenEvent,
      context,
    );
    // Expect no errors.
    expect(response.batchItemFailures.length).toEqual(0);
  });
});
