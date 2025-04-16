// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventschemas from 'aws-cdk-lib/aws-eventschemas';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import {
  getDefaultLogsRetentionPeriod,
  STAGE,
  UNICORN_NAMESPACES,
} from '../constructs/helper';
import PublicationEvaluationCompletedEventSchema from '../../integration/PublicationEvaluationCompleted.json';

/**
 * Properties for the EventsDomain construct
 * @interface EventsDomainProps
 */
interface EventsDomainProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Construct that defines the Events infrastructure for the Unicorn Properties service.
 * @class EventsDomain
 *
 * @example
 * ```typescript
 * const eventsDomain = new EventsDomain(stack, 'EventsDomain', {
 *   stage: STAGE.dev
 * });
 * ```
 */
export class EventsDomain extends Construct {
  /** EventBridge event bus for application events */
  public readonly eventBus: events.EventBus;

  /**
   * Creates a new EventsDomain construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - Custom EventBridge event bus
   * - Event schema registry and schemas
   * - Development environment logging
   * - SSM parameters for cross-stack references
   */
  constructor(scope: Construct, id: string, props: EventsDomainProps) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                                 EVENT BUS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Custom EventBridge event bus for the application
     * Handles all application-specific events and enables event-driven architecture
     */
    this.eventBus = new events.EventBus(
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
    this.eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: `AllowSubscribersToCreateSubscriptionRules-properties-${props.stage}`,
        effect: iam.Effect.ALLOW,
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:*Rule', 'events:*Targets'],
        resources: [this.eventBus.eventBusArn],
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
      eventBus: this.eventBus,
      statementId: `OnlyPropertiesServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [this.eventBus.eventBusArn],
        conditions: {
          StringEquals: { 'events:source': UNICORN_NAMESPACES.PROPERTIES },
        },
      }).toJSON(),
    });
    /**
     * CloudFormation output exposing the EventBus name
     * Enables other stacks and services to reference this event bus
     */
    new cdk.CfnOutput(this, 'UnicornPropertiesEventBusName', {
      key: 'UnicornPropertiesEventBusName',
      value: this.eventBus.eventBusName,
    });

    /* -------------------------------------------------------------------------- */
    /*                              SSM PARAMETERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * SSM Parameter storing the event bus name
     * Enables other services to discover the event bus without CloudFormation references
     */
    new ssm.StringParameter(this, 'UnicornPropertiesEventBusNameParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornPropertiesEventBus`,
      stringValue: this.eventBus.eventBusName,
    });

    /**
     * SSM Parameter storing the event bus ARN
     * Enables other services to reference the event bus for IAM policies
     */
    new ssm.StringParameter(this, 'UnicornPropertiesEventBusArnParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornPropertiesEventBusArn`,
      stringValue: this.eventBus.eventBusArn,
    });

    /* -------------------------------------------------------------------------- */
    /*                           DEVELOPMENT LOGGING                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Development environment logging configuration
     * Creates CloudWatch log groups to capture all events for debugging
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
        description: 'Catch all events published by the Properties service.',
        eventBus: this.eventBus,
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
      new cdk.CfnOutput(this, 'UnicornPropertiesCatchAllLogGroupName', {
        key: 'UnicornPropertiesCatchAllLogGroupName',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupName,
      });
      new cdk.CfnOutput(this, 'UnicornPropertiesCatchAllLogGroupArn', {
        key: 'UnicornPropertiesCatchAllLogGroupArn',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupArn,
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
     * Schema definition for publication approval requests
     * Ensures consistent event structure for property publication workflow
     */
    const publicationEvaluationCompletedSchema = new eventschemas.CfnSchema(
      this,
      'PublicationEvaluationCompletedSchema',
      {
        type: 'OpenApi3',
        registryName: registry.attrRegistryName,
        description: 'The schema for when a property evaluation is completed',
        schemaName: `${registry.attrRegistryName}@PublicationEvaluationCompleted`,
        content: JSON.stringify(PublicationEvaluationCompletedEventSchema),
      }
    );

    /**
     * Registry access policy
     * Controls who can access and use the event schemas
     */
    const registryPolicy = new eventschemas.CfnRegistryPolicy(
      this,
      'RegistryPolicy',
      {
        registryName: registry.attrRegistryName,
        policy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: 'AllowExternalServices',
              effect: iam.Effect.ALLOW,
              principals: [
                new iam.AccountPrincipal(cdk.Stack.of(this).account),
              ],
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
      }
    );
    registryPolicy.node.addDependency(publicationEvaluationCompletedSchema);
  }
}
