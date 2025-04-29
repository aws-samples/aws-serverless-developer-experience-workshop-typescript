#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
// import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './constructs/helper';
import { PropertiesEventStack } from './app/unicorn-properties-events-stack';
import { PropertyContractsStack } from './app/unicorn-properties-contracts-stack';
import { PropertyApprovalStack } from './app/unicorn-properties-property-approval-stack';
import { PropertiesToContractsIntegrationStack } from './app/unicorn-properties-integration-with-contracts-stack';
import { PropertiesToWebIntegrationStack } from './app/unicorn-properties-integration-with-web-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
// cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

const eventsStack = new PropertiesEventStack(
  app,
  `uni-prop-${stage}-properties-events`,
  {
    description:
      'Unicorn Properties Events Service. Central event bus for unicorn properties.',
    stage,
    env,
  }
);

const contractsStack = new PropertyContractsStack(
  app,
  `uni-prop-${stage}-properties-contracts`,
  {
    description: 'Unicorn Properties Contracts Service. Manages contract data.',
    stage,
    env,
  }
);

const propertyApprovalStack = new PropertyApprovalStack(
  app,
  `uni-prop-${stage}-properties-approval`,
  {
    description: 'Unicorn Properties Approval Service. Manages contract data.',
    stage,
    env,
    propertyApprovalSyncFunctionName:
      contractsStack.propertyApprovalSyncFunctionName,
    contractStatusTableName: contractsStack.contractStatusTableName,
  }
);
propertyApprovalStack.addDependency(contractsStack);
contractsStack.addDependency(eventsStack);

/**
 * These stacks are used when integrating the Properties services with other Unicorn Properties services.
 * They require the other services be fully deployed prior to deployment.
 */
new PropertiesToContractsIntegrationStack(
  app,
  `uni-prop-${stage}-properties-integration-with-contracts`,
  {
    description: 'Unicorn Properties to Contracts service integration.',
    stage,
    contractsEventBusArnParam: `/uni-prop/${stage}/UnicornContractsEventBusArn`,
    env,
  }
);

new PropertiesToWebIntegrationStack(
  app,
  `uni-prop-${stage}-properties-integration-with-web`,
  {
    description: 'Unicorn Properties to Web service integration.',
    stage,
    webEventBusArnParam: `/uni-prop/${stage}/UnicornWebEventBusArn`,
    env,
  }
);
