#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornConstractsStack } from '../lib/unicorn-contracts';
import { Stage, UNICORN_CONTRACTS_NAMESPACE } from 'unicorn_shared';

const app = new cdk.App();


const generateTags = (stage: Stage) => {
    return {
        stage: stage,
        project: "AWS_Serverless_Developer_Experience",
        namespace: UNICORN_CONTRACTS_NAMESPACE
    }
}

Object.values(Stage).map((stage) => {
    const contractsStack = new UnicornConstractsStack(app, `uni-prop-${stage}-contracts`, {
        stage: stage,
        tags: generateTags(stage),
    });

})
