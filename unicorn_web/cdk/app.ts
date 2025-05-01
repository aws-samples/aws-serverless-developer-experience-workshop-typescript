#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { App } from 'aws-cdk-lib';

import { getStageFromContext } from './lib/helper';
import { WebEventsStack } from './app/unicorn-web-events-stack';
import { WebApiStack } from './app/unicorn-web-api-stack';
import { WebPropertySearchStack } from './app/unicorn-web-property-search-stack';
import { WebPropertyPublicationStack } from './app/unicorn-web-property-publication-stack';
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

/**
 * Retrieve deployment stage from CDK context
 * Determines the environment (dev, test, prod) for resource naming and configuration
 */
const stage = getStageFromContext(app);

const eventsStack = new WebEventsStack(app, `uni-prop-${stage}-web-events`, {
  description: 'Unicorn Web Events Service',
  stage,
  env,
});

const apiStack = new WebApiStack(app, `uni-prop-${stage}-web-api`, {
  description: 'Unicorn Web API Base Infrastructure',
  stage,
  env,
});
apiStack.addDependency(eventsStack, 'requires EventBus from Events Stack');

const propertySearchStack = new WebPropertySearchStack(
  app,
  `uni-prop-${stage}-web-property-search`,
  {
    description: 'Unicorn Web Property Search Service',
    stage,
    env,
    eventBusName: eventsStack.eventBusNameParameter,
    tableName: apiStack.webTableNameParameter,
    restApiId: apiStack.webRestApiIdParameter,
    restApiRootResourceId: apiStack.webApiRootResourceIdParameter,
    restApiUrl: apiStack.webApiUrlParameter,
  }
);
propertySearchStack.addDependency(
  apiStack,
  'requires Table and Api from Api Stack'
);

const propertyPublicationStack = new WebPropertyPublicationStack(
  app,
  `uni-prop-${stage}-web-property-publication`,
  {
    description: 'Unicorn Web Property Publication Service',
    stage,
    env,
    eventBusName: eventsStack.eventBusNameParameter,
    tableName: apiStack.webTableNameParameter,
    restApiId: apiStack.webRestApiIdParameter,
    restApiRootResourceId: apiStack.webApiRootResourceIdParameter,
    restApiUrl: apiStack.webApiUrlParameter,
  }
);
propertyPublicationStack.addDependency(
  apiStack,
  'requires Table and Api from Api Stack'
);

/**
 * Deploy the integration stack between Web and Properties services
 * Creates:
 * - Event subscriptions between services
 * - Cross-service communication infrastructure
 *
 * @param webStack.eventBus - EventBus from the main web stack for event routing
 * @param propertiesEventBusArnParam - SSM parameter containing the Properties service EventBus ARN
 */
const webToProperties = new WebToPropertiesIntegrationStack(
  app,
  `uni-prop-${stage}-web-integration-with-properties`,
  {
    description: 'Unicorn Web to Properties Service integration.',
    stage,
    env,
    eventBusNameParameter: eventsStack.eventBusNameParameter,
    propertiesEventBusArnParam: `/uni-prop/${stage}/UnicornPropertiesEventBusArn`,
  }
);
webToProperties.addDependency(
  propertyPublicationStack,
  'requires Web service to be fully deployed'
);
webToProperties.addDependency(
  propertySearchStack,
  'requires Web service to be fully deployed'
);
