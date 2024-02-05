#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornConstractsStack } from '../lib/unicorn-contracts';
import { Stage, UNICORN_CONTRACTS_NAMESPACE } from 'unicorn_shared';

const app = new cdk.App();

Object.values(Stage).map((stage) => {
    new UnicornConstractsStack(app, `uni-prop-${stage}-contracts`, {
        tags: {
            stage: Stage.local,
    project: "AWS_Serverless_Developer_Experience",
    namespace: UNICORN_CONTRACTS_NAMESPACE
        }
        , stage: stage, env: { account: "819998446679", region: "ap-southeast-2" }
    });
    // new EventsSchemaStack()
    // new SubscriberPoliciesStack()
})
