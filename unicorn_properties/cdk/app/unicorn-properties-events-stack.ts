// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

import {
  getDefaultLogsRetentionPeriod,
  StackHelper,
  STAGE,
  UNICORN_NAMESPACES,
} from '../lib/helper';

/**
 * Properties for the PropertiesEventStackProps
 * @interface PropertiesEventStackProps
 *
 * Defines configuration properties required for the event infrastructure stack
 * including the deployment stage for environment-specific configurations.
 */
interface PropertiesEventStackProps extends cdk.StackProps {
  /** Deployment stage of the application (local, dev, prod) */
  stage: STAGE;
}

/**
 * Stack that defines the core event infrastructure for the Properties service.
 * @class PropertiesEventStack
 *
 * This stack establishes the event backbone of the application, demonstrating
 * key concepts of event-driven architectures including:
 * - Custom event buses for domain-specific events
 * - Event schema management and validation
 * - Development-time event logging
 * - Cross-service event routing
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new PropertiesEventStack(app, 'PropertiesEventStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class PropertiesEventStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;
  /** Name of SSM Parameter that holds the EventBus for this service */
  public readonly eventBusNameParameter: string;
  /**
   * Creates a new PropertiesEventStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - Custom EventBridge event bus for the Properties service's domain events
   * - Event bus resource policies for cross-account access
   * - Event schema registry for maintaining event contract definitions
   * - SSM parameters for service discovery
   * - Development environment logging infrastructure
   * - Event schemas for property publication workflow
   */
  constructor(scope: cdk.App, id: string, props: PropertiesEventStackProps) {
    super(scope, id, props);
    this.stage = props.stage;
    this.eventBusNameParameter = 'UnicornPropertiesEventBus';

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.PROPERTIES,
      stage: this.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                                 EVENT BUS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Custom EventBridge event bus for the application
     * Handles all application-specific events and enables event-driven architecture
     */
    const eventBus = new events.EventBus(
      this,
      `UnicornPropertiesBus-${props.stage}`,
      {
        eventBusName: `UnicornPropertiesBus-${props.stage}`,
      }
    );

    /**
     * Resource policy allowing subscribers to create rules and targets
     * Enables other services to subscribe to events from this bus
     */
    eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: `AllowSubscribersToCreateSubscriptionRules-properties-${props.stage}`,
        effect: iam.Effect.ALLOW,
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:*Rule', 'events:*Targets'],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEqualsIfExists: {
            'events:creatorAccount': cdk.Stack.of(this).account,
          },
        },
      })
    );

    /**
     * Event bus policy restricting event publishing permissions
     * Only allows services from UnicornPropertiesNamespace to publish events
     */
    new events.EventBusPolicy(this, 'UnicornPropertiesEventsBusPublishPolicy', {
      eventBus: eventBus,
      statementId: `OnlyPropertiesServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEquals: { 'events:source': UNICORN_NAMESPACES.PROPERTIES },
        },
      }).toJSON(),
    });

    /**
     * CloudFormation output exposing the EventBus name
     * Enables other stacks and services to reference this event bus
     */
    StackHelper.createOutput(this, {
      name: this.eventBusNameParameter,
      value: eventBus.eventBusName,
      stage: props.stage,
      // Create an SSM Parameter to allow other services to discover the event bus
      createSsmStringParameter: true,
    });
    StackHelper.createOutput(this, {
      name: `${this.eventBusNameParameter}Arn`,
      value: eventBus.eventBusArn,
      stage: props.stage,
      // Create an SSM Parameter to allow other services to discover the event bus
      createSsmStringParameter: true,
    });

    /* -------------------------------------------------------------------------- */
    /*                           DEVELOPMENT LOGGING                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Development environment event logging infrastructure
     *
     * Demonstrates debugging patterns for event-driven architectures:
     * - Captures all events for development visibility
     * - Implements environment-specific logging
     * - Provides audit trail for event flow
     *
     * Note: This logging is only enabled in local and dev environments
     */
    if (props.stage === STAGE.local || STAGE.dev) {
      /**
       * CloudWatch log group for catching all events during development
       * Helps with debugging and monitoring event flow
       */
      const catchAllLogGroup = new logs.LogGroup(
        this,
        'UnicornPropertiesCatchAllLogGroup',
        {
          logGroupName: `/aws/events/${props.stage}/${UNICORN_NAMESPACES.PROPERTIES}-catchall`,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }
      );

      /**
       * EventBridge rule to capture all events for development purposes
       * Routes all events to CloudWatch logs for visibility
       */
      new events.Rule(this, 'properties.catchall', {
        ruleName: 'properties.catchall',
        description: `Catch all events published by the ${UNICORN_NAMESPACES.PROPERTIES} service.`,
        eventBus: eventBus,
        eventPattern: {
          account: [cdk.Stack.of(this).account],
          source: [UNICORN_NAMESPACES.PROPERTIES],
        },
        enabled: true,
        targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
      });

      /**
       * CloudFormation outputs for log group information
       * Provides easy access to logging resources
       */
      StackHelper.createOutput(this, {
        name: 'UnicornPropertiesCatchAllLogGroupName',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupName,
        stage: props.stage,
      });
      StackHelper.createOutput(this, {
        name: 'UnicornPropertiesCatchAllLogGroupArn',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupArn,
        stage: props.stage,
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                              EVENTS SCHEMA                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * EventBridge Schema Registry for event schema management
     * Stores and validates event schemas for the application
     */
    const registry = new eventschemas.CfnRegistry(this, 'EventRegistry', {
      registryName: `${UNICORN_NAMESPACES.PROPERTIES}-${props.stage}`,
      description: `Event schemas for Unicorn Properties ${props.stage}`,
    });

    /**
     * Registry access policy
     * Controls who can access and use the event schemas
     */
    new eventschemas.CfnRegistryPolicy(this, 'RegistryPolicy', {
      registryName: registry.attrRegistryName,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            sid: 'AllowExternalServices',
            effect: iam.Effect.ALLOW,
            principals: [new iam.AccountPrincipal(cdk.Stack.of(this).account)],
            actions: [
              'schemas:DescribeCodeBinding',
              'schemas:DescribeRegistry',
              'schemas:DescribeSchema',
              'schemas:GetCodeBindingSource',
              'schemas:ListSchemas',
              'schemas:ListSchemaVersions',
              'schemas:SearchSchemas',
            ],
            resources: [
              registry.attrRegistryArn,
              `arn:aws:schemas:${cdk.Stack.of(this).region}:${
                cdk.Stack.of(this).account
              }:schema/${registry.attrRegistryName}*`,
            ],
          }),
        ],
      }),
    });
  }
}
