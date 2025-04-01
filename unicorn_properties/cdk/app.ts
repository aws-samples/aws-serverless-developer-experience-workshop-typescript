#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Stage, UnicornPropertiesStack } from './app/unicorn-properties-stack';
import { PropertiesIntegrationStack } from './app/unicorn-properties-integration-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
// cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const propertiesStack = new UnicornPropertiesStack(app, `uni-prop-${Stage.local}-properties`, {
    description: 'Unicorn Properties Service. Validate the content, images and contgract of property listings.',
    stage: Stage.local,
    env,
});

new PropertiesIntegrationStack(app, `uni-prop-${Stage.local}-properties-integration`, {
    description: 'Unicorn Properties to Web & Contracts service integration.',
    stage: Stage.local,
    propertiesEventBus: propertiesStack.eventBus,
    webEventBusArnParam: `/uni-prop/${Stage.local}/UnicornWebEventBusArn`,
    contractsEventBusArnParam: `/uni-prop/${Stage.local}/UnicornContractsEventBusArn`,
    env,
})

