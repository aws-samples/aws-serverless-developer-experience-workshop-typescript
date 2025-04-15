// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from '../constructs/helper';

/**
 * Properties for the WebToPropertiesIntegrationStack
 * @interface WebToPropertiesIntegrationStackProps
 */
interface WebToPropertiesIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** SSM parameter name containing the Properties service EventBus ARN */
  propertiesEventBusArnParam: string;
  /** EventBus instance from the Web service */
  webEventBus: events.IEventBus;
}

/**
 * Stack that manages integration between Web and Properties services
 * Handles event routing and subscriptions between the two services
 * @class WebToPropertiesIntegrationStack
 *
 * @example
 * ```typescript
 * const integrationStack = new WebToPropertiesIntegrationStack(app, 'WebPropertiesIntegration', {
 *   stage: STAGE.dev,
 *   propertiesEventBusArnParam: '/uni-prop/dev/PropertiesEventBusArn',
 *   webEventBus: myWebEventBus
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
    this.addStackTags();

    /**
     * Cross-service event subscription
     * Routes property evaluation events from Properties service to Web service
     *
     * Configuration:
     * - Subscribes to PublicationEvaluationCompleted events
     * - Source filtered to Properties service namespace
     * - Forwards events to Web service event bus
     */
    new crossUniPropServiceSubscription(
      this,
      'unicorn.web-PublicationEvaluationCompletedSubscription',
      {
        // SSM parameter containing the publisher's (Properties service) EventBus ARN
        publisherEventBusArnParam: props.propertiesEventBusArnParam,

        // Target EventBus in the Web service
        subscriberEventBus: props.webEventBus,

        // Rule configuration for event routing
        subscriptionRuleName: 'unicorn.web-PublicationEvaluationCompleted',
        subscriptionDescription:
          'Subscription to PublicationEvaluationCompleted events by the Web Service.',

        // Event pattern defining which events to forward
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.PROPERTIES],
          detailType: ['PublicationEvaluationCompleted'],
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
    cdk.Tags.of(this).add('namespace', UNICORN_NAMESPACES.WEB);
    cdk.Tags.of(this).add('stage', this.stage);
    cdk.Tags.of(this).add('project', 'AWS Serverless Developer Experience');
  }
}
