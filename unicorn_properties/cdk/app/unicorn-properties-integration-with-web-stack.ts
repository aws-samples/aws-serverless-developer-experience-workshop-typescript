// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from '../constructs/helper';

/**
 * Properties for the PropertiesToWebIntegrationStack
 * @interface PropertiesToWebIntegrationStackProps
 */
interface PropertiesToWebIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** SSM parameter name containing the Web service EventBus ARN */
  webEventBusArnParam: string;
  /** EventBus instance from the Properties service */
  propertiesEventBus: events.IEventBus;
}

/**
 * Stack that manages integration between Properties and Web services
 * Handles event routing and subscriptions between the two services
 * @class PropertiesToWebIntegrationStack
 *
 * @example
 * ```typescript
 * const integrationStack = new PropertiesToWebIntegrationStack(app, 'PropertiesWebIntegration', {
 *   stage: STAGE.dev,
 *   webEventBusArnParam: '/uni-web/dev/WebEventBusArn',
 *   propertiesEventBus: myPropertiesEventBus
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
    this.addStackTags();

    /**
     * Cross-service event subscription
     * Routes property evaluation events from Web service to Properties service
     *
     * Configuration:
     * - Subscribes to PublicationApprovalRequested events
     * - Source filtered to Web service namespace
     * - Forwards events to Properties service event bus
     */
    new crossUniPropServiceSubscription(
      this,
      'unicorn.properies-PublicationApprovalRequestedSubscription',
      {
        // SSM parameter containing the publisher's (Web service) EventBus ARN
        publisherEventBusArnParam: props.webEventBusArnParam,
        // Target EventBus in the Properties service
        subscriberEventBus: props.propertiesEventBus,
        // Rule configuration for event routing
        subscriptionRuleName:
          'unicorn.properties-PublicationApprovalRequestedSubscription',
        subscriptionDescription:
          'Subscription to PublicationApprovalRequested events by the Properties Service.',
        // Event pattern defining which events to forward
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.WEB],
          detailType: ['PublicationApprovalRequested'],
        },
      }
    );
  }
  /**
   * Adds standard tags to the CloudFormation stack
   * @private
   *
   * @remarks
   * Tags added:
   * - namespace: Identifies the service namespace
   * - stage: Identifies the deployment stage
   * - project: Identifies the project name
   */
  private addStackTags(): void {
    cdk.Tags.of(this).add('namespace', UNICORN_NAMESPACES.PROPERTIES);
    cdk.Tags.of(this).add('stage', this.stage);
    cdk.Tags.of(this).add('project', 'AWS Serverless Developer Experience');
  }
}
