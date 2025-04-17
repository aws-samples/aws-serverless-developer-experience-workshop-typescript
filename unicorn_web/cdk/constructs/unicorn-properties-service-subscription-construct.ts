// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Lazy } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';

/**
 * Parameters for creating a cross-service event subscription
 * @interface crossUniPropServiceSubscriptionParameters
 */
export interface crossUniPropServiceSubscriptionConstructProps {
  /** SSM parameter name containing the publisher's EventBus ARN */
  publisherEventBusArnParam: string;
  /** Name of the EventBridge rule for the subscription */
  subscriptionRuleName: string;
  /** Description of the subscription's purpose */
  subscriptionDescription: string;
  /** Event pattern defining which events to subscribe to */
  subscriptionEventPattern: events.EventPattern;
  /** Target EventBus where matched events will be sent */
  subscriberEventBus: events.IEventBus;
}

/**
 * Construct that creates a cross-service event subscription between EventBridge buses
 * Enables event-driven communication between different services
 * @class crossUniPropServiceSubscription
 *
 * @example
 * ```typescript
 * const subscription = new crossUniPropServiceSubscription(this, 'ServiceSubscription', {
 *   publisherEventBusArnParam: '/uni-prop/dev/PublisherEventBusArn',
 *   subscriptionRuleName: 'PublicationEvaluationCompletedRule',
 *   subscriptionDescription: 'Forward property publication evaluation completed events to subscriber service',
 *   subscriptionEventPattern: {
 *     source: [UNICORN_NAMESPACES.PROPERTIES],
 *     detailType: ['PublicationEvaluationCompleted']
 *   },
 *   subscriberEventBus: myEventBus
 * });
 * ```
 */
export class crossUniPropServiceSubscriptionConstruct extends Construct {
  /**
   * Creates a new cross-service event subscription
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration parameters
   *
   * @remarks
   * This construct:
   * - Retrieves the publisher's EventBus ARN from SSM Parameter Store
   * - Creates an EventBridge rule on the publisher's bus
   * - Configures the rule to forward matching events to the subscriber's bus
   */
  constructor(
    scope: Construct,
    id: string,
    props: crossUniPropServiceSubscriptionConstructProps
  ) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                         PUBLISHER EVENT BUS LOOKUP                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Retrieve the publisher's EventBus ARN from SSM Parameter Store
     * Uses CDK's valueFromLookup for cross-stack reference
     */
    const publisherEventBusArn = ssm.StringParameter.valueFromLookup(
      this,
      props.publisherEventBusArnParam
    );

    /**
     * Convert the SSM parameter value to a token
     * Required because valueFromLookup returns a dummy value during initial synthesis
     * Token ensures the actual value is resolved after the lookup is completed
     */
    const resolvedPublisherEventBusArn = Lazy.string({
      produce: () => publisherEventBusArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                         EVENT SUBSCRIPTION SETUP                             */
    /* -------------------------------------------------------------------------- */

    /**
     * Reference to the publisher's EventBus
     * Created using the ARN retrieved from SSM
     */
    const publisherEventBus = events.EventBus.fromEventBusArn(
      this,
      'publisherEventBus',
      resolvedPublisherEventBusArn
    );

    /**
     * EventBridge rule for the subscription
     * Forwards matching events from publisher to subscriber
     *
     * Configuration includes:
     * - Rule name for identification
     * - Description of the rule's purpose
     * - Event pattern for filtering events
     * - Target EventBus for forwarding events
     */
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
