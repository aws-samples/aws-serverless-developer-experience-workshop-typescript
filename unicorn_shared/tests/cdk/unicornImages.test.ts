// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UnicornImagesStack } from '../../cdk/unicornImages';
import { STAGE } from '../../cdk/constructs/images-construct';

describe('Unicorn Namespaces Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  const _stages = [STAGE.local, STAGE.dev, STAGE.prod] as const;
  const stacks = {} as Record<(typeof _stages)[number], cdk.Stack>;

  beforeAll(() => {
    app = new cdk.App();
    _stages.forEach((stage) => {
      stacks[stage] = new UnicornImagesStack(app, `TestStack-${stage}`, {
        stage,
      });
    });
    stack = stacks[STAGE.local];
    template = Template.fromStack(stack);
  });

  describe('Stage-specific tests', () => {
    test.each(_stages)(
      'Creates S3 bucket with correct configuration for %s',
      (stage) => {
        const stageTemplate = Template.fromStack(stacks[stage]);
        stageTemplate.hasResourceProperties('AWS::S3::Bucket', {
          // your assertions
        });
      }
    );

    test.each(_stages)(
      'Creates SSM Parameter for %s images bucket',
      (stage) => {
        const stageTemplate = Template.fromStack(stacks[stage]);
        stageTemplate.hasResourceProperties('AWS::SSM::Parameter', {
          // your assertions
        });
      }
    );
  });

  describe('Non-stage-specific tests', () => {
    test('Creates Lambda function for image upload', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Handler: 'index.handler',
        Runtime: 'python3.11',
      });
    });

    test('Creates appropriate permissions for image upload function', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com',
              },
            },
          ],
        }),
        ManagedPolicyArns: [
          {
            'Fn::Join': [
              '',
              [
                'arn:',
                Match.objectLike({
                  Ref: 'AWS::Partition',
                }),
                ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
              ],
            ],
          },
        ],
      });
    });
  });
});
