// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { ImagesInfraConstruct } from './constructs/images-construct';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class UnicornImagesStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);
    const _stages = ['local', 'dev', 'prod'] as const;

    _stages.forEach((stage) => {
      const imagesInfra = new ImagesInfraConstruct(
        this,
        `ImagesInfra-${stage}`,
        { stage: stage }
      );

      // Images infrastructure Output
      new CfnOutput(this, `ImageUploadBucketName-${stage}`, {
        description: `S3 bucket for property images (${stage})`,
        value: imagesInfra.imagesBucket.bucketName,
      });
    });
  }
}
