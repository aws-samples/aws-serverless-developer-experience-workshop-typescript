#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
// import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './constructs/helper';
import { UnicornPropertiesStack } from './app/unicorn-properties-stack';
import { PropertiesToContractsIntegrationStack } from './app/unicorn-properties-integration-with-contracts-stack';
import { PropertiesToWebIntegrationStack } from './app/unicorn-properties-integration-with-web-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
// cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

const propertiesStack = new UnicornPropertiesStack(
  app,
  `uni-prop-${stage}-properties`,
  {
    description:
      'Unicorn Properties Service. Validate the content, images and contgract of property listings.',
    stage,
    env,
  }
);

new PropertiesToContractsIntegrationStack(
  app,
  `uni-prop-${stage}-properties-integration-with-contracts`,
  {
    description: 'Unicorn Properties to Contracts service integration.',
    stage,
    propertiesEventBus: propertiesStack.eventBus,
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
    propertiesEventBus: propertiesStack.eventBus,
    webEventBusArnParam: `/uni-prop/${stage}/UnicornWebEventBusArn`,
    env,
  }
);
