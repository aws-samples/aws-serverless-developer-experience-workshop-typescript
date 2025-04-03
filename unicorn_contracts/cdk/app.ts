#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

import { getStageFromContext } from './app/helper';
import { UnicornConstractsStack } from './app/unicorn-contracts-stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const stage = getStageFromContext(app);

new UnicornConstractsStack(app, `uni-prop-${stage}-contracts`, {
    description:
        'Unicorn Contracts Service. Manage contract information for property listings.',
    stage,
    env,
});
