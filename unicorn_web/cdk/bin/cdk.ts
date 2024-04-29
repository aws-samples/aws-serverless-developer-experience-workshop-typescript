#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornWebStack } from '../lib/unicorn-web-stack';
import { Stage, UNICORN_NAMESPACES } from 'unicorn_shared';

const app = new cdk.App();


const generateTags = (stage: Stage) => {
    return {
        stage: stage,
        project: "AWS_Serverless_Developer_Experience",
        namespace: UNICORN_NAMESPACES.WEB
    }
}

Object.values(Stage).map((stage) => {
    const webStack = new UnicornWebStack(app, `uni-prop-${stage}-web`, {
        stage: stage,
        tags: generateTags(stage),
    });

})
