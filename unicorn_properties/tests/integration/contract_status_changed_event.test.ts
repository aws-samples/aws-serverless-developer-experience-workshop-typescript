import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { sleep, findOutputValue, sendContractStatusChanged } from "./helper";

describe("Testing draft contract event handling", () => {
  it("Should create a draft contract", async () => {
    const ddb = new DynamoDBClient({});
    const contractStatusTableName = await findOutputValue(
      "ContractStatusTableName",
    );
    await sendContractStatusChanged(
      "usa/anytown/main-street/111",
      "f2bedc80-3dc8-4544-9140-9b606d71a6ee",
      "DRAFT",
    );

    await sleep(5000);

    const ddbResp = await ddb.send(
      new GetItemCommand({
        TableName: contractStatusTableName,
        Key: {
          property_id: { S: "usa/anytown/main-street/111" },
        },
      }),
    );
    console.log(ddbResp);
    expect(ddbResp.Item).toBeTruthy();
    if (!ddbResp.Item) throw Error("Contract not found");
    expect(ddbResp.Item.contract_status?.S).toBe("DRAFT");
    expect(ddbResp.Item.sfn_wait_approved_task_token).toBe(undefined);
  }, 20000);

  it("Should update an existing contract status to APPROVED", async () => {
    const ddb = new DynamoDBClient({});
    const contractStatusTableName = await findOutputValue(
      "ContractStatusTableName",
    );
    await sendContractStatusChanged(
      "usa/anytown/main-street/111",
      "f2bedc80-3dc8-4544-9140-9b606d71a6ee",
      "APPROVED",
    );

    await sleep(2000); // Sleep for 2 seconds

    const ddbResp = await ddb.send(
      new GetItemCommand({
        TableName: contractStatusTableName,
        Key: {
          property_id: { S: "usa/anytown/main-street/111" },
        },
      }),
    );

    if (!ddbResp.Item) throw new Error("Contract not found");
    expect(ddbResp.Item.contract_status?.S).toBe("APPROVED");
  }, 20000);
});
