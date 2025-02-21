import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { NagSuppressions} from 'cdk-nag';

export interface ImagesInfraConstructProps {
  stage: 'local' | 'dev' | 'prod';
}

export class ImagesInfraConstruct extends Construct {

  public readonly ImagesBucket: s3.Bucket;
  public readonly ImagesBucketParameter: ssm.StringParameter;

  constructor(
    scope: Construct,
    id: string,
    props: ImagesInfraConstructProps,
  ) {
    super(scope, id);

    // S3 Property Images Bucket
    this.ImagesBucket = new s3.Bucket(this, 'UnicornPropertiesImagesBucket', {
      bucketName: `uni-prop-${props.stage}-images-${Stack.of(this).account}-${Stack.of(this).region}`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    })
    NagSuppressions.addResourceSuppressions(this.ImagesBucket, [
      { id: 'AwsSolutions-S1', reason: 'No access logs for images bucket' },
    ])

    // SSM Parameter
    this.ImagesBucketParameter = new ssm.StringParameter(this, 'UnicornPropertiesImagesBucketParam', {
      parameterName: `/uni-prop/${props.stage}/ImagesBucket`,
      stringValue: this.ImagesBucket.bucketName,
      description: `Images bucket for ${props.stage} environment.`,
      simpleName: false,
    })

    const propertyImagesBucket = s3.Bucket.fromBucketName(this, 'propertyImagesBucket', 'aws-serverless-developer-experience-workshop-assets')
    new s3deploy.BucketDeployment(this, 'DeployImages', {
      sources: [s3deploy.Source.bucket(propertyImagesBucket, 'property_images/property_images.zip')],
      destinationBucket: this.ImagesBucket,
      retainOnDelete: false,
      extract: true,
    })

  }

}