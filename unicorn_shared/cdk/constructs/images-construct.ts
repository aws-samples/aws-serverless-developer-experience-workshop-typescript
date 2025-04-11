// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { NagSuppressions } from 'cdk-nag';

export enum STAGE {
  local = 'local',
  dev = 'dev',
  prod = 'prod',
}
export interface ImagesInfraConstructProps {
  stage: 'local' | 'dev' | 'prod';
}

export class ImagesInfraConstruct extends Construct {
  public readonly imagesBucket: s3.Bucket;
  public readonly imagesBucketParameter: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: ImagesInfraConstructProps) {
    super(scope, id);

    // S3 Property Images Bucket
    const bucketName = `uni-prop-${props.stage}-images-${Stack.of(this).account}-${Stack.of(this).region}`
    const commonBucketProperties: s3.BucketProps = {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    }

    // Prod environment requires S3 access logging while other environments do not.
    if (props.stage === STAGE.prod) {
      const accessLogsBucket = new s3.Bucket(this, 'UnicornPropertiesAccessLogBucket', {
        ...commonBucketProperties,
        bucketName: `${bucketName}-logs`,
      })
      this.imagesBucket = new s3.Bucket(this, 'UnicornPropertiesImagesBucket', {
        ...commonBucketProperties,
        bucketName: `uni-prop-${props.stage}-images-${Stack.of(this).account}-${Stack.of(this).region}`,
        serverAccessLogsBucket: accessLogsBucket,
        serverAccessLogsPrefix: 'access-logs',
      });
    } else {
      this.imagesBucket = new s3.Bucket(this, 'UnicornPropertiesImagesBucket', {
        ...commonBucketProperties,
        bucketName: `uni-prop-${props.stage}-images-${Stack.of(this).account}-${Stack.of(this).region}`,
      });
      NagSuppressions.addResourceSuppressions(this.imagesBucket, [
        {
          id: 'AwsSolutions-S1',
          reason: 'Access logs for images bucket not required in local or dev environments',
        },
      ]);
    }

    // SSM Parameter
    this.imagesBucketParameter = new ssm.StringParameter(
      this,
      'UnicornPropertiesImagesBucketParam',
      {
        parameterName: `/uni-prop/${props.stage}/ImagesBucket`,
        stringValue: this.imagesBucket.bucketName,
        description: `Images bucket for ${props.stage} environment.`,
        simpleName: false,
      }
    );

    const propertyImagesBucket = s3.Bucket.fromBucketName(
      this,
      'propertyImagesBucket',
      'aws-serverless-developer-experience-workshop-assets'
    );
    const propertyImagesDeployment = new s3deploy.BucketDeployment(this, 'DeployImages', {
      sources: [
        s3deploy.Source.bucket(
          propertyImagesBucket,
          'property_images/property_images.zip'
        ),
      ],
      destinationBucket: this.imagesBucket,
      destinationKeyPrefix: '/',
      retainOnDelete: false,
      extract: true,
    });
  }
}
