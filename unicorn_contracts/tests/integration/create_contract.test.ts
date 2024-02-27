// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  findOutputValue,
  clearDatabase,
  getCloudWatchLogsValues,
  sleep,
} from "./helper";

describe("Testing creating contracts", () => {
  let apiUrl: string;

  beforeAll(async () => {
    // Clear DB
    await clearDatabase();
    // Find API Endpoint
    apiUrl = await findOutputValue("ApiUrl");
  });

  afterAll(async () => {
    // Clear DB
    await clearDatabase();
  });

  it("Should create a item in DynamoDB and fire a eventbridge event", async () => {
    const response = await fetch(`${apiUrl}contracts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{ "address": { "country": "USA", "city": "Anytown", "street": "Main Street", "number": 111 }, "seller_name": "John Doe", "property_id": "usa/anytown/main-street/111" }',
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
    expect(event.value["detail"].contract_status).toEqual("DRAFT");
  }, 20000);
});
