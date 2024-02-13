// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  initialiseDatabase,
  findOutputValue,
  clearDatabase,
  getCloudWatchLogsValues,
  sleep,
} from "./helper";

describe("Testing updating contracts", () => {
  let apiUrl: string;

  beforeAll(async () => {
    // Clear DB
    await clearDatabase();
    // Load data
    await initialiseDatabase();
    // Find API Endpoint
    apiUrl = await findOutputValue("ApiUrl");
  });

  afterAll(async () => {
    // Clear DB
    await clearDatabase();
  });

  it("Should update the item in DynamoDB and fire a eventbridge event when an existing contract is updated", async () => {
    const response = await fetch(`${apiUrl}contracts`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: '{"property_id":"usa/anytown/main-street/111"}',
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ message: "OK" });
    await sleep(10000);
    const event = await getCloudWatchLogsValues(
      "usa/anytown/main-street/111"
    ).next();
    expect(event.value["detail-type"]).toEqual("ContractStatusChanged");
    expect(event.value["detail"].property_id).toEqual(
      "usa/anytown/main-street/111"
    );
    expect(event.value["detail"].contract_status).toEqual("APPROVED");
  }, 30000);
});
