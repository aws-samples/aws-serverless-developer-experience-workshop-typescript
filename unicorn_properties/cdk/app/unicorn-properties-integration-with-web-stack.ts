// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

import { CrossUniPropServiceSubscriptionConstruct } from '../constructs/unicorn-properties-service-subscription-construct';
import { StackHelper, STAGE, UNICORN_NAMESPACES } from '../lib/helper';

/**
 * Properties for the PropertiesToWebIntegrationStack
 * @interface PropertiesToWebIntegrationStackProps
 *
 * Defines configuration properties required for service integration between
 * the Properties and Web services, demonstrating loose coupling through
 * event-driven integration patterns.
 */
interface PropertiesToWebIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application (local, dev, prod) */
  stage: STAGE;
  /** Name of SSM Parameter containing this service's Event Bus name */
  eventBusNameParameter: string;
  /** SSM parameter name containing the Web service EventBus ARN */
  webEventBusArnParam: string;
}

/**
 * Stack that manages integration between Properties and Web services
 * @class PropertiesToWebIntegrationStack
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
 * new PropertiesToWebIntegrationStack(app, 'PropertiesWebIntegration', {
 *   stage: STAGE.dev,
 *   webEventBusArnParam: '/uni-contracts/dev/WebEventBusArn',
 * });
 * ```
 */
export class PropertiesToWebIntegrationStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new PropertiesToWebIntegrationStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack configuration properties
   *
   * @remarks
   * This stack creates:
   * - Event subscription from Web service to Properties service
   * - Routes PublicationApprovalRequested events to the Properties service
   */
  constructor(
    scope: Construct,
    id: string,
    props: PropertiesToWebIntegrationStackProps
  ) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.PROPERTIES,
      stage: this.stage,
    });

    /**
     * Retrieve the Properties service EventBus name from SSM Parameter Store
     * and create a reference to the existing EventBus
     */
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'PropertiesEventBus',
      StackHelper.lookupSsmParameter(
        this,
        `/uni-prop/${props.stage}/${props.eventBusNameParameter}`
      )
    );
    /**
     * Cross-service event subscription
     * Routes property evaluation events from Web service to Properties service
     *
     * Configuration:
     * - Subscribes to PublicationApprovalRequested events
     * - Source filtered to Web service namespace
     * - Forwards events to Properties service event bus
     */
    new CrossUniPropServiceSubscriptionConstruct(
      this,
      'unicorn.properies-PublicationApprovalRequestedSubscription',
      {
        // SSM parameter containing the publisher's (Web service) EventBus ARN
        publisherEventBusArnParam: props.webEventBusArnParam,
        publisherNameSpace: UNICORN_NAMESPACES.WEB,
        subscriberEventBus: eventBus,
        subscriberNameSpace: UNICORN_NAMESPACES.PROPERTIES,
        eventTypeName: 'PublicationApprovalRequested',
      }
    );
  }
}
