// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Lazy } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { UNICORN_NAMESPACES } from './helper';

/**
 * Properties for the CrossUniPropServiceSubscriptionProps
 * @interface CrossUniPropServiceSubscriptionProps
 *
 * Defines configuration properties required for creating cross-service event subscriptions,
 * enabling type-safe event routing between Unicorn services.
 */
interface CrossUniPropServiceSubscriptionProps {
  /** SSM parameter name containing the publisher's EventBus ARN */
  publisherEventBusArnParam: string;
  /** EventBus instance that will receive the events */
  subscriberEventBus: events.IEventBus;
  /** Namespace identifier for the publishing service */
  publisherNameSpace: UNICORN_NAMESPACES;
  /** Namespace identifier for the subscribing service */
  subscriberNameSpace: UNICORN_NAMESPACES;
  /** Name of the event type to subscribe to */
  eventTypeName: string;
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
export class CrossUniPropServiceSubscriptionConstruct extends Construct {
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
    props: CrossUniPropServiceSubscriptionProps
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

    const ruleName = `${props.publisherNameSpace}-${props.eventTypeName}`;
    new events.Rule(this, ruleName, {
      ruleName,
      description: `Subscription to ${props.eventTypeName} events by the ${props.subscriberNameSpace} service.`,
      eventBus: publisherEventBus,
      eventPattern: {
        source: [props.publisherNameSpace],
        detailType: [props.eventTypeName],
      },
      enabled: true,
      targets: [new targets.EventBus(props.subscriberEventBus)],
    });
  }
}
