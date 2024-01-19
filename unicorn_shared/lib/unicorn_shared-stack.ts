import { App, CustomResource, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { Stage } from '../bin/unicorn_shared';

interface UnicornSharedStackProps extends StackProps {
  stage: Stage
}

export class UnicornSharedStack extends Stack {
  constructor(scope: App, id: string, props: UnicornSharedStackProps) {
    super(scope, id, props);

    /* 
     SSM PARAMETERS
     */

    /* Service Namespaces */
    new ssm.StringParameter(this, 'UnicornContractsNamespaceParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornContractsNamespace`,
      stringValue: "unicorn.contracts",
    });
    new ssm.StringParameter(this, 'UnicornPropertiesNamespaceParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornPropertiesNamespace`,
      stringValue: "unicorn.properties",
    });
    new ssm.StringParameter(this, 'UnicornWebNamespaceParam', {
      parameterName: `/uni-prop/${props.stage}/UnicornWebNamespace`,
      stringValue: "unicorn.web",
    });

    /*
      S3 PROPERTY IMAGES BUCKET
    */
    const imagesBucket = new s3.Bucket(this, 'UnicornPropertiesImagesBucket', {
      bucketName: `uni-prop-${props.stage}-images-${this.account}`
    });

    /* Images S3 Bucket */
    new ssm.StringParameter(this, 'UnicornPropertiesImagesBucketParam', {
      parameterName: `/uni-prop/${props.stage}/ImagesBucket`,
      stringValue: imagesBucket.bucketArn
    });


    /* IMAGE UPLOAD CUSTOM RESOURCE FUNCTION */
    const imageUploadFunction = new lambda.Function(this, 'ImageUploadFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      timeout: Duration.seconds(15),
      memorySize: 128,
      tracing: lambda.Tracing.ACTIVE,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.lambda_handler',
      code: lambda.Code.fromInline(`
import os
import zipfile
from urllib.request import urlopen
import boto3
import cfnresponse

zip_file_name = 'property_images.zip'
url = f"https://aws-serverless-developer-experience-workshop-assets.s3.amazonaws.com/property_images/{zip_file_name}"
temp_zip_download_location = f"/tmp/{zip_file_name}"

s3 = boto3.resource('s3')

def create(event, context):
  image_bucket_name = event['ResourceProperties']['DestinationBucket']
  bucket = s3.Bucket(image_bucket_name)
  print(f"downloading zip file from: {url} to: {temp_zip_download_location}")
  r = urlopen(url).read()
  with open(temp_zip_download_location, 'wb') as t:
    t.write(r)
    print('zip file downloaded')

  print(f"unzipping file: {temp_zip_download_location}")
  with zipfile.ZipFile(temp_zip_download_location,'r') as zip_ref:
    zip_ref.extractall('/tmp')
  
  print('file unzipped')
  
  # upload to s3
  for root,_,files in os.walk('/tmp/property_images'):
    for file in files:
      print(f"file: {os.path.join(root, file)}")
      print(f"s3 bucket: {image_bucket_name}")
      imagesBucket.upload_file(os.path.join(root, file), file)
def delete(event, context):
  image_bucket_name = event['ResourceProperties']['DestinationBucket']
  img_bucket = s3.Bucket(image_bucket_name)
  img_imagesBucket.objects.delete()
  img_imagesBucket.delete()
def lambda_handler(event, context):
  try:
    if event['RequestType'] in ['Create', 'Update']:
      create(event, context)
    elif event['RequestType'] in ['Delete']:
      delete(event, context)
  except Exception as e:
    print(e)
  cfnresponse.send(event, context, cfnresponse.SUCCESS, dict())
      `)
    });
    imagesBucket.grantReadWrite(imageUploadFunction);
    imagesBucket.grantDelete(imageUploadFunction)

    new CustomResource(this, 'ImageUpload', {
      serviceToken: imageUploadFunction.functionArn,
    })
  }
}
