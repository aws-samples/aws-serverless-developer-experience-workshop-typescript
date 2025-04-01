#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Stage, UnicornWebStack } from './app/unicorn-web-stack';
import { WebIntegrationStack } from './app/unicorn-web-integration-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const webStack = new UnicornWebStack(app, `uni-prop-${Stage.local}-web`, {
    description: 'Unicorn Web Service - web interface. Add, list and get details for Unicorn Properties.',
    stage: Stage.local,
    env,
});

new WebIntegrationStack(app, `uni-prop-${Stage.local}-web-integration`, {
    description: 'Unicorn Web to Properties Service integration.',
    stage: Stage.local,
    propertiesEventBusArnParam: `/uni-prop/${Stage.local}/UnicornPropertiesEventBusArn`,
    webEventBus: webStack.eventBus,
    env,
})
