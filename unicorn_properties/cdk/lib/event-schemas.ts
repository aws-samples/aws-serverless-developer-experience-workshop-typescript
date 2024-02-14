#!/usr/bin/env node
import { Stack } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { Stage } from 'unicorn_shared';
import { CfnRegistry, CfnRegistryPolicy, CfnSchema } from "aws-cdk-lib/aws-eventschemas";
import { AccountPrincipal, PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";

interface EventSchemaStackProps {
    namespace: string,
    stage: Stage,
}


/* 
  Defines the event bus policies that determine who can create rules on the event bus to
  subscribe to events published by Unicorn Contracts Service.
 */

export class EventsSchemaStack extends Construct {
    constructor(scope: Construct, id: string, props: EventSchemaStackProps) {
        super(scope, id);

        const eventRegistryName = `${props.namespace}-${props.stage}`;
        const registry = new CfnRegistry(this, `${props.namespace}`, {
            description: 'Event schemas for Unicorn Contracts',
            registryName: eventRegistryName
        });

        const eventSchema = new CfnSchema(this, 'ContractStatusChangedEventSchema', {
            type: 'OpenApi3',
            registryName: eventRegistryName,
            description: 'The schema for a request to publish a property',
            schemaName: `${eventRegistryName}@ContractStatusChanged`,
            content: JSON.stringify({
                "openapi": "3.0.0",
                "info": {
                    "version": "1.0.0",
                    "title": "ContractStatusChanged"
                },
                "paths": {},
                "components": {
                    "schemas": {
                        "AWSEvent": {
                            "type": "object",
                            "required": [
                                "detail-type",
                                "resources",
                                "detail",
                                "id",
                                "source",
                                "time",
                                "region",
                                "version",
                                "account"
                            ],
                            "x-amazon-events-detail-type": "ContractStatusChanged",
                            "x-amazon-events-source": eventRegistryName,
                            "properties": {
                                "detail": {
                                    "$ref": "#/components/schemas/ContractStatusChanged"
                                },
                                "account": {
                                    "type": "string"
                                },
                                "detail-type": {
                                    "type": "string"
                                },
                                "id": {
                                    "type": "string"
                                },
                                "region": {
                                    "type": "string"
                                },
                                "resources": {
                                    "type": "array",
                                    "items": {
                                        "type": "object"
                                    }
                                },
                                "source": {
                                    "type": "string"
                                },
                                "time": {
                                    "type": "string",
                                    "format": "date-time"
                                },
                                "version": {
                                    "type": "string"
                                }
                            }
                        },
                        "ContractStatusChanged": {
                            "type": "object",
                            "required": [
                                "contract_last_modified_on",
                                "contract_id",
                                "contract_status",
                                "property_id"
                            ],
                            "properties": {
                                "contract_id": {
                                    "type": "string"
                                },
                                "contract_last_modified_on": {
                                    "type": "string",
                                    "format": "string"
                                },
                                "contract_status": {
                                    "type": "string"
                                },
                                "property_id": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                }
            })
        });

        const registryPolicy = new CfnRegistryPolicy(this, 'RegistryPolicy', {
            registryName: eventRegistryName,
            policy: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        sid: "AllowExternalServices",
                        principals: [new AccountPrincipal(Stack.of(this).account)],
                        actions: [
                            "schemas:DescribeCodeBinding"
                            , "schemas:DescribeRegistry"
                            , "schemas:DescribeSchema"
                            , "schemas:GetCodeBindingSource"
                            , "schemas:ListSchemas"
                            , "schemas:ListSchemaVersions"
                            , "schemas:SearchSchemas"
                        ],
                        resources: [registry.attrRegistryArn, eventSchema.attrSchemaArn]
                        //- Fn::GetAtt: EventRegistry.RegistryArn
                        //- Fn::Sub: "arn:${AWS::Partition}:schemas:${AWS::Region}:${AWS::AccountId}:schema/${EventRegistry.RegistryName}*"
                    })
                ]
            }).toString()
        })

        eventSchema.addDependency(registry);
    }
}
