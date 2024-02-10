// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "./powertools";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  QueryCommandInput,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Empty configuration for DynamoDB
const ddbClient = new DynamoDBClient({});
const DDB_TABLE = process.env.DYNAMODB_TABLE;

const PROJECTION_PROPERTIES =
  "country, city, street, contract, #num, description, listprice, currency, #status";

type PropertyDBType = {
  country: string;
  city: string;
  street: string;
  contract?: string;
  number: string;
  description: string;
  listprice?: number;
  currency: string;
  status: string;
};

class PropertySearchFunction implements LambdaInterface {
  /**
   * Search for properties
   * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
   * @param {Object} event - API Gateway Lambda Proxy Input Format
   *
   * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
   * @returns {Object} object - API Gateway Lambda Proxy Output Format
   *
   */
  @tracer.captureLambdaHandler()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @logger.injectLambdaContext({ logEvent: true })
  public async handler(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    // Inspect request path.
    logger.info(`Handling request for ${event.resource}`);
    if (event.resource == "/search/{country}/{city}") {
      return await this.listPropertiesByCity(event, context);
    } else if (event.resource == "/search/{country}/{city}/{street}") {
      return await this.listPropertiesByStreet(event, context);
    } else if (
      event.resource == "/properties/{country}/{city}/{street}/{number}"
    ) {
      return await this.propertyDetails(event, context);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Unable to handle resource ${event.resource}`,
        }),
      };
    }
  }

  /**
   * List the properties in the system by searching for country and city
   * Resource: /search/{country}/{city}
   * @param event
   * @param context
   * @returns
   */
  @tracer.captureMethod()
  private async listPropertiesByCity(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    const country = event.pathParameters?.country;
    const city = event.pathParameters?.city;
    logger.info(
      `List properties by city: country = ${country}; city = ${city}`
    );

    const PK = `PROPERTY#${country}#${city}`;

    const queryCommandInput: QueryCommandInput = {
      KeyConditionExpression: `PK = :pk`,
      ExpressionAttributeValues: {
        ":pk": { S: PK },
        ":s": { S: "APPROVED" },
      },
      ProjectionExpression: PROJECTION_PROPERTIES,
      ExpressionAttributeNames: { "#num": "number", "#status": "status" },
      FilterExpression: "#status = :s",
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new QueryCommand(queryCommandInput));

    if (data.Items === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Unable to find results for ${event.resource}`,
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify(this.consolidateResults(data)),
      };
    }
  }

  /**
   * Check the output before returning an array of results.
   * @param data The output data from the DynamoDB query
   */
  private consolidateResults(data: QueryCommandOutput): any[] {
    let results: PropertyDBType[] = [];
    for (var item of data.Items as any[]) {
      const obj: PropertyDBType = unmarshall(item) as PropertyDBType;
      if (obj.status == "APPROVED") {
        results.push(obj);
      } else {
        logger.warn(`Property ${JSON.stringify(obj)} is NOT APPROVED`);
      }
    }
    return results;
  }

  /**
   * List the properties in the system by searching for country, city and street
   * Resource: /search/{country}/{city}/{street}
   * @param event
   * @param context
   * @returns
   */
  @tracer.captureMethod()
  private async listPropertiesByStreet(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    const country = event.pathParameters?.country;
    const city = event.pathParameters?.city;
    const street = event.pathParameters?.street;
    logger.info(
      `List properties by street: country = ${country}; city = ${city}; street = ${street}`
    );

    const PK = `PROPERTY#${country}#${city}`;
    const SK = `${street}`;

    const queryCommandInput: QueryCommandInput = {
      KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
      ExpressionAttributeValues: {
        ":pk": { S: PK },
        ":sk": { S: SK },
        ":s": { S: "APPROVED" },
      },
      ProjectionExpression: PROJECTION_PROPERTIES,
      ExpressionAttributeNames: { "#num": "number", "#status": "status" },
      FilterExpression: "#status = :s",
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new QueryCommand(queryCommandInput));

    if (data.Items === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Unable to find results for ${event.resource}`,
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify(this.consolidateResults(data)),
      };
    }
  }

  /**
   * List the specific property in the sytem.
   * Resource: /search/{country}/{city}/{street}/{number}
   * @param event
   * @param context
   * @returns
   */
  @tracer.captureMethod()
  private async propertyDetails(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    const country = event.pathParameters?.country;
    const city = event.pathParameters?.city;
    const street = event.pathParameters?.street;
    const number = event.pathParameters?.number;
    console.log(`Country: ${country}`);
    console.log(`City: ${city}`);
    console.log(`street: ${street}`);
    console.log(`number: ${number}`);
    console.log(`PROJECT PROPS: ${PROJECTION_PROPERTIES}`);

    logger.info(
      `Get property details for: country = ${country}; city = ${city}; street = ${street}; number = ${number}`
    );

    const PK = `PROPERTY#${country}#${city}`;
    const SK = `${street}#${number}`;

    const getItemCommandInput: GetItemCommandInput = {
      Key: {
        PK: { S: PK },
        SK: { S: SK },
      },
      ProjectionExpression: PROJECTION_PROPERTIES,
      ExpressionAttributeNames: { "#num": "number", "#status": "status" },
      TableName: DDB_TABLE,
    };

    const data = await ddbClient.send(new GetItemCommand(getItemCommandInput));
    if (data.Item === undefined) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No property for ${JSON.stringify(event.pathParameters)}`,
        }),
      };
    } else {
      const dataObj = unmarshall(data.Item) as PropertyDBType;
      if (dataObj.status !== `APPROVED`) {
        logger.warn(
          `Property for ${JSON.stringify(event.pathParameters)} is NOT APPROVED`
        );
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `No property for ${JSON.stringify(event.pathParameters)}`,
          }),
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify(dataObj),
        };
      }
    }
  }
}

export const myFunction = new PropertySearchFunction();
export const lambdaHandler = myFunction.handler.bind(myFunction);
