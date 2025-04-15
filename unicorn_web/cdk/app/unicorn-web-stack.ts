// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';

import { STAGE, UNICORN_NAMESPACES } from '../constructs/helper';
import { EventsDomain } from '../constructs/unicorn-web-events-domain';
import { ApiDomain } from '../constructs/unicorn-web-api-domain';
import { PropertySearchDomain } from '../constructs/unicorn-web-property-search-domain';
import { PropertyPublicationDomain } from '../constructs/unicorn-web-property-publication-domain';

/**
 * Properties for the UnicornWebStack
 * @interface UnicornWebStackProps
 */
interface UnicornWebStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Stack that defines the Unicorn Web infrastructure
 * @class UnicornWebStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new UnicornWebStack(app, 'UnicornWebStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class UnicornWebStack extends cdk.Stack {
  /** EventBridge event bus for application events */
  public readonly eventBus: events.EventBus;
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new UnicornWebStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - DynamoDB table for data storage
   * - API Gateway REST API
   * - EventBridge event bus
   * - Property publication domain
   * - Property eventing domain
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: UnicornWebStackProps) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    this.addStackTags();

    /* -------------------------------------------------------------------------- */
    /*                                  STORAGE                                     */
    /* -------------------------------------------------------------------------- */

    /**
     * DynamoDB table for storing web application data
     * Uses a composite key (PK/SK) design pattern for flexible querying
     * Includes stream configuration for change data capture
     */
    const table = new dynamodb.TableV2(this, `WebTable`, {
      tableName: `uni-prop-${this.stage}-web-WebTable`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // be careful with this in production
    });
    /**
     * CloudFormation output exposing the DynamoDB table name
     * Useful for cross-stack references and operational visibility
     */
    new cdk.CfnOutput(this, 'WebTableName', {
      exportName: 'WebTableName',
      description: 'DynamoDB table storing property information',
      value: table.tableName,
    });

    /* -------------------------------------------------------------------------- */
    /*                                  EVENT BUS                                   */
    /* -------------------------------------------------------------------------- */

    /**
     * Event bus domain for handling application events
     * Manages event routing and integration between components
     */
    const webEventsDomain = new EventsDomain(this, 'EventsDomain', {
      stage: this.stage,
    });
    this.eventBus = webEventsDomain.eventBus;

    /* -------------------------------------------------------------------------- */
    /*                             API GATEWAY REST API                             */
    /* -------------------------------------------------------------------------- */

    /**
     * API domain for handling HTTP requests
     * Provides RESTful interface for the web application
     */
    const webApiDomain = new ApiDomain(this, 'ApiDomain', {
      stage: this.stage,
    });

    /**
     * Property Search domain handling property lookup functionality
     * Integrates with DynamoDB for data retrieval
     */
    new PropertySearchDomain(this, 'PropertySearchDomain', {
      stage: this.stage,
      table: table,
      api: webApiDomain.api,
    });

    /**
     * Property Publication domain handling property creation and updates
     * Integrates with DynamoDB for storage and EventBridge for event publishing
     */
    new PropertyPublicationDomain(this, 'PropertyPublicationDomain', {
      stage: this.stage,
      table: table,
      eventBus: this.eventBus,
      api: webApiDomain.api,
    });
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
