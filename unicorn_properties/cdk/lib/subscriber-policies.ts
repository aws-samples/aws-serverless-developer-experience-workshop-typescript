import { Stack } from "aws-cdk-lib";
import { aws_events as events } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { IEventBus } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";

import { Stage } from "unicorn_shared";

interface SubscriberPoliciesStackProps {
  stage: Stage,
  eventBus: IEventBus
  namespace: string
}

/*
  Defines the event bus policies that determine who can create rules on the event bus to
  subscribe to events published by the Contracts Service.
*/
export class SubscriberPoliciesStack extends Construct {
  constructor(scope: Construct, id: string, props: SubscriberPoliciesStackProps) {
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
        "events:RemoveTargets"
      ],
      resources: [props.eventBus.eventBusArn],
      conditions: {
        "StringEqualsIfExists": {
          "events:creatorAccount": Stack.of(this).account
        },
        "StringEquals": {
          "events:source": props.namespace
        }
      }
    }).toJSON();
    const eventBusPolicy = new events.EventBusPolicy(this, 'MyEventBusPolicy', {
      statementId: `OnlyRulesForContractServiceEvents-${props.stage}`,
      eventBus: props.eventBus,
      statement: policyStatement,
    });


  }
}