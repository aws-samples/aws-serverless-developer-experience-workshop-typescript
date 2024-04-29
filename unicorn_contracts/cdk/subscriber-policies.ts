import { aws_events as events } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Stage, UNICORN_NAMESPACES } from "unicorn_shared";


interface SubscriberPoliciesProps {
  stage: Stage;
  eventBus: events.EventBus;
  sources: UNICORN_NAMESPACES[];
}
/*
  Defines the event bus policies that determine who can create rules on the event bus to
  subscribe to events published by the Contracts Service.
*/
export class SubscriberPoliciesConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: SubscriberPoliciesProps
  ) {
    super(scope, id);

    const policyStatement = new iam.PolicyStatement({
      principals: [new iam.AccountRootPrincipal()],
      actions: [
        "events:PutRule",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:DisableRule",
        "events:EnableRule",
        "events:PutTargets",
        "events:RemoveTargets",
      ],
      resources: [props.eventBus.eventBusArn],
      conditions: {
        StringEquals: {
          "events:source": props.sources,
        },
        StringEqualsIfExists: {
          "events:creatorAccount": Stack.of(this).account,
        },
        Null: {
          "events:source": "false",
        },
      },
    }).toJSON();

    const eventBusPolicy = new events.EventBusPolicy(this, `EventBusPolicy`, {
      statementId: `${props.eventBus.eventBusName}-${props.stage}-policy`,
      eventBus: props.eventBus,
      statement: policyStatement,
    });
  }
}
