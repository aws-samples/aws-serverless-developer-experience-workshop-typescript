#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { UnicornConstractsStack } from './unicorn-contracts-stack';
import { Stage, UNICORN_NAMESPACES } from 'unicorn_shared';

const app = new cdk.App();
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const generateTags = (stage: Stage) => {
    return {
        stage: stage,
        project: 'AWS_Serverless_Developer_Experience',
        namespace: UNICORN_NAMESPACES.CONTRACTS,
    };
};

new UnicornConstractsStack(app, `uni-prop-${Stage.local}-contracts`, {
    stage: Stage.local,
    tags: generateTags(Stage.local),
});

// new UnicornContractsPipelineStack(app, `uni-prop-contracts-pipeline`, {stage: Stage.local});
