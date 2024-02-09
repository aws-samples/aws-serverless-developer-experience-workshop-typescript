// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context } from "aws-lambda";
import { randomUUID } from "crypto";
import { lambdaHandler } from "../../src/properties_service/contentIntegrityValidatorFunction";

describe("Unit tests for contract status checking", function () {
  type eventType = {
    imageModerations: any[];
    contentSentiment: any;
  };

  const baselineStepFunctionEvent: eventType = {
    imageModerations: [],
    contentSentiment: {
      Sentiment: "POSITIVE",
      SentimentScore: {
        Mixed: 0.00021626291,
        Negative: 0.0000997818,
        Neutral: 0.0005670016,
        Positive: 0.99911696,
      },
    },
  };

  beforeEach(() => {});

  test("Verifies PASS", async () => {
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedResponse = { statusCode: 200, validation_result: "PASS" };
    expect(response.validation_result).toEqual(
      expectedResponse.validation_result,
    );
    expect(response.statusCode).toEqual(200);
  });

  test("Verifies FAIL on content sentiment", async () => {
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    baselineStepFunctionEvent.contentSentiment.Sentiment = "NEGATIVE";

    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedResponse = { statusCode: 200, validation_result: "FAIL" };
    expect(response.validation_result).toEqual(
      expectedResponse.validation_result,
    );
    expect(response.statusCode).toEqual(200);
  });

  test("Verifies FAIL on image moderation", async () => {
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;

    baselineStepFunctionEvent.contentSentiment.Sentiment = "POSITIVE";
    baselineStepFunctionEvent.imageModerations.push({
      ModerationLabels: [{ Name: "Pills" }],
    });
    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedResponse = { statusCode: 200, validation_result: "FAIL" };
    expect(response.validation_result).toEqual(
      expectedResponse.validation_result,
    );
    expect(response.statusCode).toEqual(200);
  });

  test("Verifies FAIL on image moderation and content", async () => {
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    baselineStepFunctionEvent.contentSentiment.Sentiment = "NEGATIVE";
    baselineStepFunctionEvent.imageModerations.push({
      ModerationLabels: [{ Name: "Pills" }],
    });
    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    const expectedResponse = { statusCode: 200, validation_result: "FAIL" };
    expect(response.validation_result).toEqual(
      expectedResponse.validation_result,
    );
    expect(response.statusCode).toEqual(200);
  });

  test("Exception handling", async () => {
    const expectedId = randomUUID();
    const context: Context = {
      awsRequestId: expectedId,
    } as any;
    baselineStepFunctionEvent.contentSentiment = undefined;
    baselineStepFunctionEvent.imageModerations.push({
      ModerationLabels: [{ Name: "Pills" }],
    });
    const response = await lambdaHandler(baselineStepFunctionEvent, context);
    expect(response.statusCode).toEqual(500);
  });
});
