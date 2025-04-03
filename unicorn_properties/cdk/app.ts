#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './app/helper';
import { UnicornPropertiesStack } from './app/unicorn-properties-stack';
import { PropertiesIntegrationStack } from './app/unicorn-properties-integration-stack';


const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
// cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

const propertiesStack = new UnicornPropertiesStack(app, `uni-prop-${stage}-properties`, {
    description: 'Unicorn Properties Service. Validate the content, images and contgract of property listings.',
    stage,
    env,
});

new PropertiesIntegrationStack(app, `uni-prop-${stage}-properties-integration`, {
    description: 'Unicorn Properties to Web & Contracts service integration.',
    stage,
    propertiesEventBus: propertiesStack.eventBus,
    webEventBusArnParam: `/uni-prop/${stage}/UnicornWebEventBusArn`,
    contractsEventBusArnParam: `/uni-prop/${stage}/UnicornContractsEventBusArn`,
    env,
})

