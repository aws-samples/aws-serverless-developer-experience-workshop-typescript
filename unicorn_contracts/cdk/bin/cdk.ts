#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornConstractsStack } from '../lib/unicorn-contracts';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { UNICORN_CONTRACTS_NAMESPACE } from 'shared';

/** The different stages for the app. */
export enum Stage {
    local = "local",
    dev = "dev",
    prod = "prod",
}

/** Account id for different stages. */
export const AccountId = {
    // BETA AWS account id
    "dev": "819998446679",
    // PROD AWS account id
    "prod": "819998446679",
}

export const LogsRetentionPeriod = (stage: Stage) => {
    switch (stage) {
        case Stage.local:
            return RetentionDays.ONE_DAY;
        case Stage.dev:
            return RetentionDays.ONE_WEEK;
        case Stage.prod:
            return RetentionDays.TWO_WEEKS
        default:
            return RetentionDays.ONE_DAY;

    }
}

export const isProd = (stage: Stage) => stage === Stage.prod;

const app = new cdk.App();

const tags = (stage: Stage) => ({
    stage: Stage.local,
    project: "AWS_Serverless_Developer_Experience",
    namespace: UNICORN_CONTRACTS_NAMESPACE
})

Object.values(Stage).map((stage) => {
    new UnicornConstractsStack(app, `uni-prop-${stage}-contracts`, {
        tags: tags(stage), stage: stage, env: { account: "819998446679", region: "ap-southeast-2" }
    });
    // new EventsSchemaStack()
    // new SubscriberPoliciesStack()
})
