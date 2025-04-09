// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UnicornImagesStack } from '../../cdk/unicornImages';

describe('Unicorn Namespaces Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    // Initialize with 'local' stage for testing
    stack = new UnicornImagesStack(app, 'TestStack', {});
    template = Template.fromStack(stack);
  });

  const _stages = ['local', 'dev', 'prod'] as const;

  _stages.forEach((stage) => {
    test(`Creates S3 bucket with correct configuration for ${stage}`, () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: {
          'Fn::Join': [
            '',
            [
              Match.stringLikeRegexp(`uni-prop-${stage}-images-.*`),
              { Ref: 'AWS::AccountId' },
              '-',
              { Ref: 'AWS::Region' },
            ],
          ],
        },
      });
    });

    test(`Creates SSM Parameter for ${stage} images bucket`, () => {
      template.hasResourceProperties('AWS::SSM::Parameter', {
        Type: 'String',
        Name: Match.stringLikeRegexp(`/uni-prop/${stage}/ImagesBucket`),
        Value: {
          Ref: Match.stringLikeRegexp('UnicornPropertiesImagesBucket.*'),
        },
      });
    });
  });

  test('Creates Lambda function for image upload', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'python3.11',
    });

    // Test Lambda function policies
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
