#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './constructs/helper';
import { UnicornWebStack } from './app/unicorn-web-stack';
import { WebToPropertiesIntegrationStack } from './app/unicorn-web-integration-with-properties-stack';

/**
 * Environment configuration for AWS deployment
 * Uses CDK default account and region from environment variables
 */
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

/**
 * Initialize the CDK application
 */
const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

/**
 * Retrieve deployment stage from CDK context
 * Determines the environment (dev, test, prod) for resource naming and configuration
 */
const stage = getStageFromContext(app);

/**
 * Deploy the main Unicorn Web Service stack
 * Creates core infrastructure including:
 * - API Gateway
 * - DynamoDB tables
 * - Lambda functions
 * - EventBridge event bus
 */
const webStack = new UnicornWebStack(app, `uni-prop-${stage}-web`, {
  description:
    'Unicorn Web Service - web interface. Add, list and get details for Unicorn Properties.',
  stage,
  env,
});

/**
 * Deploy the integration stack between Web and Properties services
 * Creates:
 * - Event subscriptions between services
 * - Cross-service communication infrastructure
 *
 * @param webStack.eventBus - EventBus from the main web stack for event routing
 * @param propertiesEventBusArnParam - SSM parameter containing the Properties service EventBus ARN
 */
new WebToPropertiesIntegrationStack(
  app,
  `uni-prop-${stage}-web-integration-with-properties`,
  {
    description: 'Unicorn Web to Properties Service integration.',
    stage,
    webEventBus: webStack.eventBus,
    propertiesEventBusArnParam: `/uni-prop/${stage}/UnicornPropertiesEventBusArn`,
    env,
  }
);
