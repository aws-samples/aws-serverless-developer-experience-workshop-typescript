#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornConstractsStack } from './unicorn-contracts-stack';
import { Stage, UNICORN_NAMESPACES } from 'unicorn_shared';

const app = new cdk.App();

const generateTags = (stage: Stage) => {
    return {
        stage: stage,
        project: 'AWS_Serverless_Developer_Experience',
        namespace: UNICORN_NAMESPACES.CONTRACTS,
    };
};

Object.values(Stage).map((stage) => {
    new UnicornConstractsStack(app, `uni-prop-${stage}-contracts`, {
        stage: stage,
        tags: generateTags(stage),
    });
});
