// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Lazy } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface crossUniPropServiceSubscriptionParameters {
  publisherEventBusArnParam: string;
  subscriptionRuleName: string;
  subscriptionDescription: string;
  subscriptionEventPattern: events.EventPattern;
  subscriberEventBus: events.IEventBus;
}

export class crossUniPropServiceSubscription extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: crossUniPropServiceSubscriptionParameters
  ) {
    super(scope, id);

    // Integration with Web service
    const publisherEventBusArn = ssm.StringParameter.valueFromLookup(
      this,
      props.publisherEventBusArnParam
    );
    /**
     *  When using valueFromLookup an initial dummy-value is returned prior to the lookup being performed using AWS APIs during synthesis.
     *  As this property supports tokens, we convert the parameter value into a token to be resolved after the lookup has been completed using Lazy.
     */
    const publisherEventBus = events.EventBus.fromEventBusArn(
      this,
      'publisherEventBus',
      Lazy.string({ produce: () => publisherEventBusArn })
    );

    new events.Rule(this, props.subscriptionRuleName, {
      ruleName: props.subscriptionRuleName,
      description: props.subscriptionDescription,
      eventBus: publisherEventBus,
      eventPattern: props.subscriptionEventPattern,
      enabled: true,
      targets: [new targets.EventBus(props.subscriberEventBus)],
    });
  }
}
