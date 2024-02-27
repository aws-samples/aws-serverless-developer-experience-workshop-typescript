// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { logger, metrics, tracer } from "./powertools";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
  PutEventsCommandOutput,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import { MetricUnits } from "@aws-lambda-powertools/metrics";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

// Empty configuration for EventBridge
const eventsClient = new EventBridgeClient({});
const EVENT_BUS = process.env.EVENT_BUS;


type PropertyDBType = {
  PK: string;
  SK: string;
  country: string;
  city: string;
  street: string;
  contract?: string;
  number: string;
  description: string;
  listprice?: number;
  currency: string;
  status: string;
  images?: string[];
};

class RequestApprovalFunction implements LambdaInterface {
  /**
   * Request approval for a particular property
   * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
   * @param {Object} event - API Gateway Lambda Proxy Input Format
   * @returns {Promise<void>}
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(event: SQSEvent, context: Context): Promise<void> {
    for (const sqsRecord of event.Records) {
      await this.requestApproval(sqsRecord, context);
    }
  }
  /**
   * Request approval for a particular property
   * @param event The request event
   * @param _context The Lambda context
   * @returns {Promise<void>}
   */
  @tracer.captureMethod()
  private async requestApproval(
    event: SQSRecord,
    _context: Context
  ): Promise<void> {
    // Parse the body.
    const data = JSON.parse(event.body);
    // Note the propertyId
    const propertyId: string = data["property_id"];
    let PK: string, SK: string;

    logger.info(`Requesting approval for property ${propertyId}`);

    try {
      // Form the PK and SK from the property id.
      const components: string[] = propertyId.split("/");
      if (components.length < 4) {
        throw new Error(`Invalid propertyId ${propertyId}`);
      }
      const country = components[0];
      const city = components[1];
      const street = components[2];
      const number = components[3];

      const pkDetails = `${country}#${city}`.replace(" ", "-").toLowerCase();
      PK = `PROPERTY#${pkDetails}`;
      SK = `${street}#${number}`.replace(" ", "-").toLowerCase();
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(`Error during parameter setup: ${JSON.stringify(error)}`);
      return;
    }

    logger.info(`Looking for property with PK ${PK} and SK ${SK}`);

    try {
      const property: PropertyDBType = await this.getPropertyFor(PK, SK);

      // If property is already being approved or approved already
      if (property.status in ["APPROVED"]) {
        logger.info(
          `Property already in status ${property.status}; no action taken`
        );
        return;
      }

      logger.info(`Requesting property approval for ${propertyId}`);

      const eventDetail = {
        property_id: propertyId,
        address: {
          country: property.country,
          city: property.city,
          street: property.street,
          number: property.number,
        },
        status: "PENDING",
        listprice: property.listprice,
        images: property.images,
        description: property.description,
      };

      await this.firePropertyEvent(eventDetail, "unicorn.web");
    } catch (error) {
      tracer.addErrorAsMetadata(error as Error);
      logger.error(`${error}`);
      metrics.addMetric("ApprovalsRequested", MetricUnits.Count, 1);
      return;
    }
  }

  /**
   * Retrieve a single property
   * @param PK PK attribute
   * @param SK SK attribute
   * @returns
   */
  private async getPropertyFor(
    PK: string,
    SK: string
  ): Promise<PropertyDBType> {
    const getItemCommandInput: GetItemCommandInput = {
      Key: { PK: { S: PK }, SK: { S: SK } },
      TableName: DDB_TABLE,
    };
    const data: GetItemCommandOutput = await ddbClient.send(
      new GetItemCommand(getItemCommandInput)
    );
    logger.info("input", { getItemCommandInput });
    logger.info("data", { data });
    if (data.Item === undefined) {
      throw new Error(`No item found for PK ${PK} and SK ${SK}`);
    }
    const result: PropertyDBType = unmarshall(data.Item) as PropertyDBType;
    logger.info("result", { result });
    return result;
  }

  /**
   * Fire property approval request event.
   * @param eventDetail
   * @param source
   */
  private async firePropertyEvent(
    eventDetail: string,
    source: string
  ): Promise<void> {
    const propertyId = eventDetail.property_id;

    // Build the Command objects
    const eventsPutEventsCommandInputEntry: PutEventsRequestEntry = {
      EventBusName: EVENT_BUS,
      Time: new Date(),
      Source: source,
      DetailType: "PublicationApprovalRequested",
      Detail: JSON.stringify(eventDetail),
    };
    const eventsPutEventsCommandInput: PutEventsCommandInput = {
      Entries: [eventsPutEventsCommandInputEntry],
    };
    const eventsPutEventsCommand = new PutEventsCommand(
      eventsPutEventsCommandInput
    );

    // Send the command
    const eventsPutEventsCommandOutput: PutEventsCommandOutput =
      await eventsClient.send(eventsPutEventsCommand);
    logger.info(
      `EventBridge Response: ${JSON.stringify(eventsPutEventsCommandOutput)}`
    );
    if (eventsPutEventsCommandOutput.$metadata.httpStatusCode != 200) {
      const error: Error = {
        name: "PropertyApprovalError",
        message: `EventBridge Response invalid for ${propertyId}: ${eventsPutEventsCommandOutput.$metadata.httpStatusCode}`,
      };
      throw error;
    }
    logger.info(`Published approval request for ${propertyId}`);
  }
}

export const myFunction = new RequestApprovalFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
