#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornPropertiesStack } from '../lib/unicorn-properties';
import { Stage, UNICORN_NAMESPACES } from 'unicorn_shared';

const app = new cdk.App();


const generateTags = (stage: Stage) => {
    return {
        stage: stage,
        project: "AWS_Serverless_Developer_Experience",
        namespace: UNICORN_NAMESPACES.PROPERTIES
    }
}

Object.values(Stage).map((stage) => {
    new UnicornPropertiesStack(app, `uni-prop-${stage}-properties`, {
        stage: stage,
        tags: generateTags(stage),
    });

})
