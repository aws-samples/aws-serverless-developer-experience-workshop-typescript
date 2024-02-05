import * as cdk from 'aws-cdk-lib';
import { App, CustomResource, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Stage } from 'unicorn_shared';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { UnicornSharedStack } from '../lib/unicorn-init';


const app = new cdk.App();
new UnicornSharedStack(app, `uni-prop-${Stage.local}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.local });
new UnicornSharedStack(app, `uni-prop-${Stage.dev}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.dev });
new UnicornSharedStack(app, `uni-prop-${Stage.prod}-shared`, { description: "Base infrastructure that will set up the central event bus and S3 image upload bucket.", stage: Stage.prod });
