// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  initialiseDatabase,
  findOutputValue,
  clearDatabase,
  getCloudWatchLogsValues,
  sleep,
} from "./helper";

describe("Testing approval requests", () => {
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

  it("Should a confirm the approval request and fire a eventbridge event", async () => {
    const response = await fetch(`${apiUrl}request_approval`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"property_id":"USA/Anytown/main-street/111"}',
    });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ message: "OK" });
    await sleep(5000);
    const event = await getCloudWatchLogsValues(
      "USA/Anytown/main-street/111"
    ).next();
    expect(event.value["detail-type"]).toEqual("PublicationApprovalRequested");
    expect(event.value["detail"].property_id).toEqual(
      "USA/Anytown/main-street/111"
    );
    expect(event.value["detail"].status).toEqual("PENDING");
  }, 10000);
});
