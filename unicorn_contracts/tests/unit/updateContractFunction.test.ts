// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { lambdaHandler } from "../../src/contracts_service/updateContractFunction";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

describe('Unit tests for contract update', function () {
    const ddbMock = mockClient(DynamoDBClient);
    const eventBridgeMock = mockClient(EventBridgeClient);

    beforeEach(() => {
        ddbMock.reset();
        eventBridgeMock.reset();
    });

    test('Verifies successful response', async () => {
        const contractId = "4781231c-bc25-4f30-8b20-7145f4dd1adb";

        ddbMock.on(UpdateItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200
            }
        });

        ddbMock.on(GetItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200 
            },
            Item: {
                "contract_id": {"S": contractId}, 
                "property_id": {"S": "4781231c-bc30-4f30-8b30-7145f4dd1adb"}, 
                "contract_status": {"S": "Draft"}, 
                "address": {"S": "Doesn't matter"}, 
                "seller_name": {"S": "Doesn't matter"}, 
                "contract_created": {"S": "Doesn't matter"}, 
                "contract_last_modified_on": {"S": "Doesn't matter"}        
            }
        });

        eventBridgeMock.on(PutEventsCommand).resolves({
            $metadata: {
                httpStatusCode: 200
            }
        });

        const event: APIGatewayProxyEvent = {
            body: JSON.stringify({
                "contract_id": contractId,
                "address": "St.1 , Building 10",
                "seller_name": "John Smith",
                "property_id": "4781231c-bc30-4f30-8b30-7145f4dd1adb"
            })
        } as any
        const context: Context = {
        } as any
        const result = await lambdaHandler(event, context);
        expect(result.statusCode).toEqual(200);
        var responseObj = JSON.parse(result.body);
        expect([responseObj.contract_id, responseObj.property_id, responseObj.contract_status]).toEqual([contractId, "4781231c-bc30-4f30-8b30-7145f4dd1adb", "APPROVED"]);
    });

    test('Invalid payload', async () => {
        const contractId = "4781231c-bc25-4f30-8b20-7145f4dd1adb";
        const event: APIGatewayProxyEvent = {
            body: JSON.stringify({
                "contract_id": contractId,
                "seller_name": "John Smith"
            })
        } as any
        const context: Context = {
        } as any
        const result = await lambdaHandler(event, context);
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify({message: `Must specify property id`}));
    });

    test('No contract exists', async () => {
        ddbMock.on(UpdateItemCommand).resolves({
            $metadata: {
                httpStatusCode: 500 
            },
        });
        const contractId = "4781231c-bc25-4f30-8b20-7145f4dd1adb";
        const propertyId = "4781231c-bc30-4f30-8b30-7145f4dd1adb";

        ddbMock.on(GetItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200 
            },
            Item: undefined
        });

        const event: APIGatewayProxyEvent = {
            body: JSON.stringify({
                "contract_id": contractId,
                "address": "St.1 , Building 10",
                "seller_name": "John Smith",
                "property_id": propertyId
            })
        } as any
        const context: Context = {
        } as any
        const result = await lambdaHandler(event, context);
        console.log("RESULT: " + JSON.stringify(result));
        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify({message: `No contract found for specified Property ID`}));
    });

    test('Failed database update', async () => {
        ddbMock.on(UpdateItemCommand).resolves({
            $metadata: {
                httpStatusCode: 500
            }
        });
        const contractId = "4781231c-bc25-4f30-8b20-7145f4dd1adb";
        const propertyId = "4781231c-bc30-4f30-8b30-7145f4dd1adb";

        ddbMock.on(GetItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200 
            },
            Item: {
                "contract_id": {"S": contractId}, 
                "property_id": {"S": "4781231c-bc30-4f30-8b30-7145f4dd1adb"}, 
                "contract_status": {"S": "Draft"}, 
                "address": {"S": "Doesn't matter"}, 
                "seller_name": {"S": "Doesn't matter"}, 
                "contract_created": {"S": "Doesn't matter"}, 
                "contract_last_modified_on": {"S": "Doesn't matter"}        
            }
        });

        const event: APIGatewayProxyEvent = {
            body: JSON.stringify({
                "contract_id": contractId,
                "address": "St.1 , Building 10",
                "seller_name": "John Smith",
                "property_id": propertyId
            })
        } as any
        const context: Context = {
        } as any
        const result = await lambdaHandler(event, context);
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({error: `Unable to update contract for property ${propertyId}`}));
    });

    test('Failed event fire', async () => {
        ddbMock.on(UpdateItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200
            }
        });

        eventBridgeMock.on(PutEventsCommand).resolves({
            $metadata: {
                httpStatusCode: 500
            }
        });

        const contractId = "4781231c-bc25-4f30-8b20-7145f4dd1adb";
        const propertyId = "4781231c-bc30-4f30-8b30-7145f4dd1adb";

        ddbMock.on(GetItemCommand).resolves({
            $metadata: {
                httpStatusCode: 200 
            },
            Item: {
                "contract_id": {"S": contractId}, 
                "property_id": {"S": "4781231c-bc30-4f30-8b30-7145f4dd1adb"}, 
                "contract_status": {"S": "Draft"}, 
                "address": {"S": "Doesn't matter"}, 
                "seller_name": {"S": "Doesn't matter"}, 
                "contract_created": {"S": "Doesn't matter"}, 
                "contract_last_modified_on": {"S": "Doesn't matter"}        
            }
        });

        const event: APIGatewayProxyEvent = {
            body: JSON.stringify({
                "contract_id": contractId,
                "address": "St.1 , Building 10",
                "seller_name": "John Smith",
                "property_id": propertyId
            })
        } as any
        const context: Context = {
        } as any
        const result = await lambdaHandler(event, context);
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual(JSON.stringify({error: `Unable to fire 'Contract updated' event for contract for property ${propertyId}`}));
    });
});