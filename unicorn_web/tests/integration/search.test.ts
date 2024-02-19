// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { clearDatabase, findOutputValue } from "./helper";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import ApprovedProperty from "../../data/approved_property.json";

describe("Testing approved property listing searches", () => {
  let apiUrl: string;

  beforeAll(async () => {
    // Clear db
    await clearDatabase();
    // Create an approved property listing
    const tableName = await findOutputValue("WebTableName");
    const docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION })
    );
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: ApprovedProperty,
      })
    );
    // Find API Endpoint
    apiUrl = await findOutputValue("ApiUrl");
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it("Should show the approved property listing in search by city", async () => {
    const response = await fetch(`${apiUrl}search/au/anytown`, {
      method: "GET",
    });
    const json = await response.json();
    expect(json).toEqual([
      {
        city: "Anytown",
        contract: "sale",
        country: "AU",
        currency: "SPL",
        listprice: 200,
        number: 1337,
        description:
          "This classic Anytown estate comes with a covetable lake view. The romantic and comfortable backyard is the perfect setting for unicorn get-togethers. The open concept Main Stable is fully equipped with all the desired amenities. Second floor features 6 straw bales including large Rainbow Suite with private training pool terrace and Jr Sparkles Suite.",
        status: "APPROVED",
        street: "Main Street",
      },
    ]);
  });

  it("Should show the approved property listing in search by street", async () => {
    const response = await fetch(`${apiUrl}search/au/anytown/main-street`, {
      method: "GET",
    });
    const json = await response.json();
    expect(json).toEqual([
      {
        city: "Anytown",
        contract: "sale",
        country: "AU",
        currency: "SPL",
        listprice: 200,
        number: 1337,
        description:
          "This classic Anytown estate comes with a covetable lake view. The romantic and comfortable backyard is the perfect setting for unicorn get-togethers. The open concept Main Stable is fully equipped with all the desired amenities. Second floor features 6 straw bales including large Rainbow Suite with private training pool terrace and Jr Sparkles Suite.",
        status: "APPROVED",
        street: "Main Street",
      },
    ]);
  });

  it("Should show the approved property listing in search by address", async () => {
    const response = await fetch(
      `${apiUrl}properties/au/anytown/main-street/1337`,
      {
        method: "GET",
      }
    );
    const json = await response.json();
    expect(json).toEqual({
      city: "Anytown",
      contract: "sale",
      country: "AU",
      currency: "SPL",
      listprice: 200,
      number: 1337,
      description:
        "This classic Anytown estate comes with a covetable lake view. The romantic and comfortable backyard is the perfect setting for unicorn get-togethers. The open concept Main Stable is fully equipped with all the desired amenities. Second floor features 6 straw bales including large Rainbow Suite with private training pool terrace and Jr Sparkles Suite.",
      status: "APPROVED",
      street: "Main Street",
    });
  });
});
