#!/usr/bin/env node
import { App, Stack } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Stage, UnicornConstractsStack } from './unicorn-contracts-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};


const app = new App();
// cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

new UnicornConstractsStack(app, `uni-prop-${Stage.local}-contracts`, {
    description: 'Unicorn Contracts Service. Manage contract information for property listings.',
    stage: Stage.local,
    serviceNamespace: 'unicorn.contracts',
    env: env,
});

// new UnicornContractsPipelineStack(app, `uni-prop-contracts-pipeline`, {stage: Stage.local});
