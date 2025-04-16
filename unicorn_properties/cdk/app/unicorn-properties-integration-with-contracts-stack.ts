// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';

import * as cdk from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from '../constructs/helper';

/**
 * Properties for the PropertiesToContractsIntegrationStack
 * @interface PropertiesToContractsIntegrationStackProps
 */
interface PropertiesToContractsIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
  /** SSM parameter name containing the Contracts service EventBus ARN */
  contractsEventBusArnParam: string;
  /** EventBus instance from the Properties service */
  propertiesEventBus: events.IEventBus;
}

/**
 * Stack that manages integration between Properties and Contracts services
 * Handles event routing and subscriptions between the two services
 * @class PropertiesToContractsIntegrationStack
 *
 * @example
 * ```typescript
 * const integrationStack = new PropertiesToContractsIntegrationStack(app, 'PropertiesContractsIntegration', {
 *   stage: STAGE.dev,
 *   contractsEventBusArnParam: '/uni-contracts/dev/ContractsEventBusArn',
 *   propertiesEventBus: myPropertiesEventBus
 * });
 * ```
 */
export class PropertiesToContractsIntegrationStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new PropertiesToContractsIntegrationStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack configuration properties
   *
   * @remarks
   * This stack creates:
   * - Event subscription from Contracts service to Properties service
   * - Routes ContractStatusUpdated events to the Properties service
   */
  constructor(
    scope: Construct,
    id: string,
    props: PropertiesToContractsIntegrationStackProps
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
     * Routes contract status events from Contracts service to Properties service
     *
     * Configuration:
     * - Subscribes to ContractStatusUpdated events
     * - Source filtered to Contracts service namespace
     * - Forwards events to Properties service event bus
     */
    new crossUniPropServiceSubscription(
      this,
      'unicorn-properties-ContractStatusChangedSubscription',
      {
        // SSM parameter containing the publisher's (Contracts service) EventBus ARN
        publisherEventBusArnParam: props.contractsEventBusArnParam,
        // Target EventBus in the Properties service
        subscriberEventBus: props.propertiesEventBus,
        // Rule configuration for event routing
        subscriptionRuleName: 'unicorn-properties-ContractStatusChanged',
        subscriptionDescription:
          'Subscription to ContractStatusChanged events by the Properties Service.',
        // Event pattern defining which events to forward
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.CONTRACTS],
          detailType: ['ContractStatusChanged'],
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
