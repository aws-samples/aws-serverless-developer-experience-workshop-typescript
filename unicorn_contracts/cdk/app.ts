#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Stage, UnicornConstractsStack } from './app/unicorn-contracts-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

new UnicornConstractsStack(app, `uni-prop-${Stage.local}-contracts`, {
    description: 'Unicorn Contracts Service. Manage contract information for property listings.',
    stage: Stage.local,
    env: env,
});

// new UnicornContractsPipelineStack(app, `uni-prop-contracts-pipeline`, {stage: Stage.local});
