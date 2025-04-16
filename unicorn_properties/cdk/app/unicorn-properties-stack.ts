// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

import { STAGE, UNICORN_NAMESPACES } from '../constructs/helper';
import { EventsDomain } from '../constructs/unicorn-properties-events-domain';
import { PropertyApprovalDomain } from '../constructs/unicorn-properties-property-approval-domain';
import { ContractsDomain } from '../constructs/unicorn-properties-contracts-domain';

/**
 * Properties for the UnicornPropertiesStack
 * @interface UnicornPropertiesStackProps
 */
interface UnicornPropertiesStackProps extends cdk.StackProps {
  /** Deployment stage of the application */
  stage: STAGE;
}

/**
 * Stack that defines the Unicorn Properties infrastructure
 * @class UnicornPropertiesStack
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * new UnicornPropertiesStack(app, 'UnicornPropertiesStack', {
 *   stage: STAGE.dev,
 *   env: {
 *     account: process.env.CDK_DEFAULT_ACCOUNT,
 *     region: process.env.CDK_DEFAULT_REGION
 *   }
 * });
 * ```
 */
export class UnicornPropertiesStack extends cdk.Stack {
  /** EventBridge event bus for application events */
  public readonly eventBus: events.EventBus;
  /** Current deployment stage of the application */
  private readonly stage: STAGE;

  /**
   * Creates a new UnicornPropertiesStack
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Configuration properties
   *
   * @remarks
   * This stack creates:
   * - EventBridge event bus through Events Domain
   * - Contracts Domain with associated DynamoDB table
   * - Property Approval Domain integrated with Contracts
   * - Associated IAM roles and permissions
   */
  constructor(scope: cdk.App, id: string, props: UnicornPropertiesStackProps) {
    super(scope, id, props);
    this.stage = props.stage;

    /**
     * Add standard tags to the CloudFormation stack for resource organization
     * and cost allocation
     */
    this.addStackTags();

    /* -------------------------------------------------------------------------- */
    /*                                 EVENTS DOMAIN                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Create Events Domain
     * Establishes central event bus for inter-domain communication
     */
    const propertiesEventDomain = new EventsDomain(this, 'EventsDomain', {
      stage: this.stage,
    });
    this.eventBus = propertiesEventDomain.eventBus;

    /* -------------------------------------------------------------------------- */
    /*                              CONTRACTS DOMAIN                                */
    /* -------------------------------------------------------------------------- */

    /**
     * Contracts Domain
     * Handles contract-related operations and data storage
     */
    const propertiesContractsDomain = new ContractsDomain(
      this,
      'ContractsDomain',
      {
        stage: this.stage,
        eventBus: propertiesEventDomain.eventBus,
      }
    );

    /* -------------------------------------------------------------------------- */
    /*                           PROPERTY APPROVAL DOMAIN                           */
    /* -------------------------------------------------------------------------- */

    /**
     * Create Property Approval Domain
     * Manages property approval workflow integrated with Contracts domain
     */
    new PropertyApprovalDomain(this, 'PropertyApprovalDomain', {
      stage: this.stage,
      table: propertiesContractsDomain.table,
      eventBus: this.eventBus,
      taskResponseFunction:
        propertiesContractsDomain.propertiesApprovalSyncFunction,
    });
  }

  /**
   * Adds standard tags to the CloudFormation stack
   * @private
   *
   * @remarks
   * Tags added:
   * - namespace: Identifies the service namespace (PROPERTIES)
   * - stage: Identifies the deployment stage
   * - project: Identifies the project name
   */
  private addStackTags(): void {
    cdk.Tags.of(this).add('namespace', UNICORN_NAMESPACES.PROPERTIES);
    cdk.Tags.of(this).add('stage', this.stage);
    cdk.Tags.of(this).add('project', 'AWS Serverless Developer Experience');
  }
}
