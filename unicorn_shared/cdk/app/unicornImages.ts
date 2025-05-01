// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ImagesInfraConstruct, STAGE } from '../constructs/images-construct';
interface UnicornImagesStackProps extends StackProps {
  stage: STAGE;
}

export class UnicornImagesStack extends Stack {
  constructor(scope: Construct, id: string, props: UnicornImagesStackProps) {
    super(scope, id);

    const imagesInfra = new ImagesInfraConstruct(
      this,
      `ImagesInfra-${props.stage}`,
      { stage: props.stage }
    );

    // Images infrastructure Output
    new CfnOutput(this, `ImageUploadBucketName-${props.stage}`, {
      description: `S3 bucket for property images (${props.stage})`,
      value: imagesInfra.imagesBucket.bucketName,
    });
  }
}
