// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { CrossUniPropServiceSubscriptionConstruct } from '../constructs/unicorn-properties-service-subscription-construct';
import { StackHelper, STAGE, UNICORN_NAMESPACES } from '../constructs/helper';

/**
 * Properties for the PropertiesToContractsIntegrationStack
 * @interface PropertiesToContractsIntegrationStackProps
 *
 * Defines configuration properties required for service integration between
 * the Properties and Contracts services, demonstrating loose coupling through
 * event-driven integration patterns.
 */
interface PropertiesToContractsIntegrationStackProps extends cdk.StackProps {
  /** Deployment stage of the application (local, dev, prod) */
  stage: STAGE;
  /** SSM parameter name containing the Contracts service EventBus ARN */
  contractsEventBusArnParam: string;
}

/**
 * Stack that manages integration between Properties and Contracts services
 * @class PropertiesToContractsIntegrationStack
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
 * new PropertiesToContractsIntegrationStack(app, 'PropertiesContractsIntegration', {
 *   stage: STAGE.dev,
 *   contractsEventBusArnParam: '/uni-contracts/dev/ContractsEventBusArn',
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
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.PROPERTIES,
      stage: this.stage,
    });

    /**
     * Retrieve the Properties service EventBus name from SSM Parameter Store
     * and create a reference to the existing EventBus
     */
    const eventBusName = ssm.StringParameter.fromStringParameterName(
      this,
      'PropertiesEventBusName',
      `/uni-prop/${props.stage}/UnicornPropertiesEventBus`
    );
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'PropertiesEventBus',
      eventBusName.stringValue
    );
    /**
     * Cross-service event subscription
     * Routes contract status events from Contracts service to Properties service
     *
     * Configuration:
     * - Subscribes to ContractStatusUpdated events
     * - Source filtered to Contracts service namespace
     * - Forwards events to Properties service event bus
     */
    new CrossUniPropServiceSubscriptionConstruct(
      this,
      'unicorn-properties-ContractStatusChangedSubscription',
      {
        // SSM parameter containing the publisher's (Contracts service) EventBus ARN
        publisherEventBusArnParam: props.contractsEventBusArnParam,
        publisherNameSpace: UNICORN_NAMESPACES.CONTRACTS,
        // Target EventBus in the Properties service
        subscriberEventBus: eventBus,
        subscriberNameSpace: UNICORN_NAMESPACES.PROPERTIES,
        eventTypeName: 'ContractStatusChanged',
      }
    );
  }
}
