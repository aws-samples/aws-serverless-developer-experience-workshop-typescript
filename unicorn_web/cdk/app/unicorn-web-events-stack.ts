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
import PublicationApprovalRequestedEventSchema from '../../integration/PublicationApprovalRequested.json';

/**
 * Properties for the WebEventsStack
 * @interface WebEventsStackProps
 */
interface WebEventsStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Stack that defines the Unicorn Web infrastructure
 * @class WebEventsStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new WebEventsStack(app, 'WebEventsStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class WebEventsStack extends cdk.Stack {
  /** Current deployment stage of the application */
  private readonly stage: STAGE;
  /** Name of SSM Parameter that holds the EventBus for this service */
  public readonly eventBusNameParameter: string;

  /**
   * Creates a new WebEventsStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - DynamoDB table for data storage
   * - API Gateway REST API
   * - EventBridge event bus
   * - Property publication Construct
   * - Property eventing Construct
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: WebEventsStackProps) {
    super(scope, id, props);
    this.stage = props.stage;
    this.eventBusNameParameter = 'UnicornWebEventBus';

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    StackHelper.addStackTags(this, {
      namespace: UNICORN_NAMESPACES.WEB,
      stage: this.stage,
    });

    /* -------------------------------------------------------------------------- */
    /*                                 EVENT BUS                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * Custom EventBridge event bus for the application
     * Handles all application-specific events and enables event-driven architecture
     */
    const eventBus = new events.EventBus(this, `UnicornWebBus-${props.stage}`, {
      eventBusName: `UnicornWebBus-${props.stage}`,
    });

    /**
     * Resource policy allowing subscribers to create rules and targets
     * Enables other services to subscribe to events from this bus
     */
    eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: `AllowSubscribersToCreateSubscriptionRules-web-${props.stage}`,
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
     * Only allows services from UnicornWebNamespace to publish events
     */
    new events.EventBusPolicy(this, 'UnicornWebEventsBusPublishPolicy', {
      eventBus: eventBus,
      statementId: `OnlyWebServiceCanPublishToEventBus-${props.stage}`,
      statement: new iam.PolicyStatement({
        principals: [new iam.AccountRootPrincipal()],
        actions: ['events:PutEvents'],
        resources: [eventBus.eventBusArn],
        conditions: {
          StringEquals: { 'events:source': UNICORN_NAMESPACES.WEB },
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
        description: `Catch all events published by the ${UNICORN_NAMESPACES.WEB} service.`,
        eventBus: eventBus,
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
      StackHelper.createOutput(this, {
        name: 'UnicornWebCatchAllLogGroupName',
        description: "Log all events on the service's EventBridge Bus",
        value: catchAllLogGroup.logGroupName,
        stage: props.stage,
      });
      StackHelper.createOutput(this, {
        name: 'UnicornWebCatchAllLogGroupArn',
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
