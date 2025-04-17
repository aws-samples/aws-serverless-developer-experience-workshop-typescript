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
} from './helper';
import PublicationApprovalRequestedEventSchema from '../../integration/PublicationApprovalRequested.json';

/**
 * Properties for the EventsConstruct construct
 * @interface EventsConstructProps
 */
interface EventsConstructProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Construct that defines the Events infrastructure for the Unicorn Web application
 * @class EventsConstruct
 *
 * @example
 * ```typescript
 * const eventsConstruct = new EventsConstruct(stack, 'EventsConstruct', {
 *   stage: STAGE.dev
 * });
 * ```
 */
export class EventsConstruct extends Construct {
  /** EventBridge event bus for application events */
  public readonly eventBus: events.EventBus;

  /**
   * Creates a new EventsConstruct construct
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This construct creates:
   * - Custom EventBridge event bus for the application
   * - Associated CloudFormation outputs for cross-stack references
   */
  constructor(scope: Construct, id: string, props: EventsConstructProps) {
    super(scope, id);

    /* -------------------------------------------------------------------------- */
    /*                                 EVENT BUS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Custom EventBridge event bus for the application
     * Handles all application-specific events and enables event-driven architecture
     */
    this.eventBus = new events.EventBus(this, `UnicornWebBus-${props.stage}`, {
      eventBusName: `UnicornWebBus-${props.stage}`,
    });

    /**
     * Resource policy allowing subscribers to create rules and targets
     * Enables other services to subscribe to events from this bus
     */
    this.eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: `AllowSubscribersToCreateSubscriptionRules-web-${props.stage}`,
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
     * Only allows services from UnicornWebNamespace to publish events
     */
    new events.EventBusPolicy(this, 'UnicornWebEventsBusPublishPolicy', {
      eventBus: this.eventBus,
      statementId: `OnlyWebServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [this.eventBus.eventBusArn],
        conditions: {
          StringEquals: { 'events:source': UNICORN_NAMESPACES.WEB },
        },
      }).toJSON(),
    });
    /**
     * CloudFormation output exposing the EventBus name
     * Enables other stacks and services to reference this event bus
     */
    new cdk.CfnOutput(this, 'UnicornWebEventBusName', {
      exportName: 'UnicornWebEventBusName',
      value: this.eventBus.eventBusName,
    });

    /* -------------------------------------------------------------------------- */
    /*                              SSM PARAMETERS                                  */
    /* -------------------------------------------------------------------------- */

    /**
     * SSM Parameter storing the event bus name
     * Enables other services to discover the event bus without CloudFormation references
     */
    new ssm.StringParameter(this, 'UnicornWebEventBusNameParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornWebEventBus`,
      stringValue: this.eventBus.eventBusName,
    });

    /**
     * SSM Parameter storing the event bus ARN
     * Enables other services to reference the event bus for IAM policies
     */
    new ssm.StringParameter(this, 'UnicornWebEventBusArnParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornWebEventBusArn`,
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
        'UnicornWebCatchAllLogGroup',
        {
          logGroupName: `/aws/events/${props.stage}/${UNICORN_NAMESPACES.WEB}-catchall`,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          retention: getDefaultLogsRetentionPeriod(props.stage),
        }
      );

      /**
       * EventBridge rule to capture all events for development purposes
       * Routes all events to CloudWatch logs for visibility
       */
      new events.Rule(this, 'web.catchall', {
        ruleName: 'web.catchall',
        description: 'Catch all events published by the Web service.',
        eventBus: this.eventBus,
        eventPattern: {
          account: [cdk.Stack.of(this).account],
          source: [UNICORN_NAMESPACES.WEB],
        },
        enabled: true,
        targets: [new targets.CloudWatchLogGroup(catchAllLogGroup)],
      });

      /**
       * CloudFormation outputs for log group information
       * Provides easy access to logging resources
       */
      new cdk.CfnOutput(this, 'UnicornWebCatchAllLogGroupName', {
        exportName: 'UnicornWebCatchAllLogGroupName',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupName,
      });
      new cdk.CfnOutput(this, 'UnicornWebCatchAllLogGroupArn', {
        exportName: 'UnicornWebCatchAllLogGroupArn',
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
      registryName: `${UNICORN_NAMESPACES.WEB}-${props.stage}`,
      description: `Event schemas for Unicorn Web ${props.stage}`,
    });

    /**
     * Schema definition for publication approval requests
     * Ensures consistent event structure for property publication workflow
     */
    const publicationApprovalRequestedSchema = new eventschemas.CfnSchema(
      this,
      'PublicationApprovalRequestedEventSchema',
      {
        type: 'OpenApi3',
        registryName: registry.attrRegistryName,
        description: 'The schema for a request to publish a property',
        schemaName: `${registry.attrRegistryName}@PublicationApprovalRequested`,
        content: JSON.stringify(PublicationApprovalRequestedEventSchema),
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
    registryPolicy.node.addDependency(publicationApprovalRequestedSchema);
  }
}
