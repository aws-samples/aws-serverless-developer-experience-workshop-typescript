// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

import { CrossUniPropServiceSubscriptionConstruct } from '../constructs/unicorn-properties-service-subscription-construct';
import { StackHelper, STAGE, UNICORN_NAMESPACES } from '../lib/helper';

/**
 * Properties for the WebToPropertiesIntegrationStack
 * @interface WebToPropertiesIntegrationStackProps
 *
 * Defines configuration properties required for service integration between
 * the Web and Properties services, demonstrating loose coupling through
 * event-driven integration patterns.
 */
interface WebToPropertiesIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** Name of SSM Parameter containing this service's Event Bus name */
  eventBusNameParameter: string;
  /** SSM parameter name containing the Properties service EventBus ARN */
  propertiesEventBusArnParam: string;
}

/**
 * Stack that manages integration between Web and Properties services
 * Handles event routing and subscriptions between the two services
 * @class WebToPropertiesIntegrationStack
 *
 * This stack demonstrates microservice integration patterns including:
 * - Event-driven service communication
 * - Cross-service event routing
 * - Service discovery using SSM parameters
 * - Loose coupling through event subscriptions
 * - Domain event filtering
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * const integrationStack = new WebToPropertiesIntegrationStack(app, 'WebPropertiesIntegration', {
 *   stage: STAGE.dev,
 *   propertiesEventBusArnParam: '/uni-prop/dev/PropertiesEventBusArn',
 * });
 * ```
 */
export class WebToPropertiesIntegrationStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;
  /**
   * Creates a new WebToPropertiesIntegrationStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack configuration properties
   *
   * @remarks
   * This stack creates:
   * - Event subscription from Properties service to Web service
   * - Routes PublicationEvaluationCompleted events to the Web service
   */
  constructor(
    scope: Construct,
    id: string,
    props: WebToPropertiesIntegrationStackProps
  ) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.WEB,
      stage: this.stage,
    });

    /**
     * Retrieve the Properties service EventBus name from SSM Parameter Store
     * and create a reference to the existing EventBus
     */
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'WebEventBus',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.eventBusNameParameter}`
      )
    );

    /**
     * Cross-service event subscription
     * Routes property evaluation events from Properties service to Web service
     *
     * Configuration:
     * - Subscribes to PublicationEvaluationCompleted events
     * - Source filtered to Properties service namespace
     * - Forwards events to Web service event bus
     */
    new CrossUniPropServiceSubscriptionConstruct(
      this,
      'unicorn.web-PublicationEvaluationCompletedSubscription',
      {
        // SSM parameter containing the publisher's (Properties service) EventBus ARN
        publisherEventBusArnParam: props.propertiesEventBusArnParam,
        publisherNameSpace: UNICORN_NAMESPACES.PROPERTIES,
        subscriberEventBus: eventBus,
        subscriberNameSpace: UNICORN_NAMESPACES.WEB,
        eventTypeName: 'PublicationEvaluationCompleted',
      }
    );
  }
}
