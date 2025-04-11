#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './app/helper';
import { UnicornWebStack } from './app/unicorn-web-stack';
import { WebToPropertiesIntegrationStack } from './app/unicorn-web-integration-with-properties-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

const webStack = new UnicornWebStack(app, `uni-prop-${stage}-web`, {
  description:
    'Unicorn Web Service - web interface. Add, list and get details for Unicorn Properties.',
  stage,
  env,
});

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
