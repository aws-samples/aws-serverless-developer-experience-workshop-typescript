import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  sleep,
  findOutputValue,
  clearDatabase,
  initializeDatabase,
} from "./helper";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import ContractStatusChangedDraftEvent from "../events/eventbridge/contract_status_changed_event_contract_1_draft.json";
import ContractApprovedEvent from "../events/eventbridge/contract_status_changed_event_contract_2_approved.json";

describe("Testing draft contract event handling", () => {
  beforeAll(async () => {
    await clearDatabase();
    await initializeDatabase();
  });

  afterAll(async () => {
    //await clearDatabase();
  });

  it("Should create a draft contract", async () => {
    // Arrange
    const ddb = new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION });
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const contractStatusTableName = await findOutputValue(
      "ContractStatusTableName"
    );

    // Act
    await evb.send(
      new PutEventsCommand({ Entries: ContractStatusChangedDraftEvent })
    );
    await sleep(5000);
    // Assert
    const getItemCommand = new GetItemCommand({
      TableName: contractStatusTableName,
      Key: { property_id: { S: "usa/anytown/main-street/111" } },
    });
    const ddbResp = await ddb.send(getItemCommand);
    expect(ddbResp?.Item).toBeTruthy();
    if (!ddbResp?.Item) throw Error("Contract not found");
    expect(ddbResp.Item.contract_status?.S).toBe("DRAFT");
    expect(ddbResp.Item.sfn_wait_approved_task_token).toBe(undefined);
  }, 20000);

  it("Should update an existing contract status to APPROVED", async () => {
    // Arrange
    const ddb = new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION });
    const evb = new EventBridgeClient({
      region: process.env.AWS_DEFAULT_REGION,
    });
    const contractStatusTableName = await findOutputValue(
      "ContractStatusTableName"
    );

    // Act
    await evb.send(new PutEventsCommand({ Entries: ContractApprovedEvent }));
    await sleep(5000);

    // Assert
    const getItemCommand = new GetItemCommand({
      TableName: contractStatusTableName,
      Key: { property_id: { S: "usa/anytown/main-street/222" } },
    });
    const ddbResp = await ddb.send(getItemCommand);
    expect(ddbResp?.Item).toBeTruthy();
    if (!ddbResp.Item) throw new Error("Contract not found");
    expect(ddbResp.Item.contract_status?.S).toBe("APPROVED");
  }, 20000);
});
