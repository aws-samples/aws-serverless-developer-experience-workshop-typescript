import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
    CfnRegistry,
    CfnRegistryPolicy,
    CfnSchema,
} from "aws-cdk-lib/aws-eventschemas";
import {
    AccountPrincipal,
    PolicyDocument,
    PolicyStatement,
} from "aws-cdk-lib/aws-iam";

interface EventSchemaProps {
    name: string;
    namespace: string;
    schemas: CfnSchema[];
}

/* 
  Defines the event bus policies that determine who can create rules on the event bus to
  subscribe to events published by Unicorn Contracts Service.
 */

export class EventsSchemaConstruct extends Construct {
    constructor(scope: Construct, id: string, props: EventSchemaProps) {
        super(scope, id);

        const registry = new CfnRegistry(this, `${props.namespace}`, {
            description: `Event schemas for ${props.namespace}`,
            registryName: props.name,
        });
        props.schemas.forEach((s) => s.node.addDependency(registry));

        const schemaArns = props.schemas.map((s) => s.attrSchemaArn);
        const registryPolicy = new CfnRegistryPolicy(this, "RegistryPolicy", {
            registryName: props.name,
            policy: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        sid: "AllowExternalServices",
                        principals: [new AccountPrincipal(Stack.of(this).account)],
                        actions: [
                            "schemas:DescribeCodeBinding",
                            "schemas:DescribeRegistry",
                            "schemas:DescribeSchema",
                            "schemas:GetCodeBindingSource",
                            "schemas:ListSchemas",
                            "schemas:ListSchemaVersions",
                            "schemas:SearchSchemas",
                        ],
                        resources: [...schemaArns, registry.attrRegistryArn],
                        //- Fn::GetAtt: EventRegistry.RegistryArn
                        //- Fn::Sub: "arn:${AWS::Partition}:schemas:${AWS::Region}:${AWS::AccountId}:schema/${EventRegistry.RegistryName}*"
                    }),
                ],
            }),
        });
        props.schemas.forEach((s) => registryPolicy.node.addDependency(s));
    }
}
