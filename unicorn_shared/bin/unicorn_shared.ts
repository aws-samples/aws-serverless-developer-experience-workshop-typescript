#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UnicornSharedStack } from '../lib/unicorn_shared-stack';

/** The different stages for the app. */
export enum Stage {
    local = "local",
    dev = "dev",
    prod = "prod",
}

const app = new cdk.App();

new UnicornSharedStack(app, `uni-prop-${Stage.local}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.local });
new UnicornSharedStack(app, `uni-prop-${Stage.dev}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.dev });
new UnicornSharedStack(app, `uni-prop-${Stage.prod}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.prod });
