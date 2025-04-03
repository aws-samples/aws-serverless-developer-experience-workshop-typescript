#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './app/helper';
import { UnicornWebStack } from './app/unicorn-web-stack';
import { WebIntegrationStack } from './app/unicorn-web-integration-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

const webStack = new UnicornWebStack(app, `uni-prop-${stage}-web`, {
    description: 'Unicorn Web Service - web interface. Add, list and get details for Unicorn Properties.',
    stage,
    env,
});

new WebIntegrationStack(app, `uni-prop-${stage}-web-integration`, {
    description: 'Unicorn Web to Properties Service integration.',
    stage,
    propertiesEventBusArnParam: `/uni-prop/${stage}/UnicornPropertiesEventBusArn`,
    webEventBus: webStack.eventBus,
    env,
})
