// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class NamespacesConstruct extends Construct {
  public readonly unicornContractsNamespace: ssm.StringParameter;
  public readonly unicornPropertiesNamespace: ssm.StringParameter;
  public readonly unicornWebNamespace: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: {}) {
    super(scope, id);

    this.unicornContractsNamespace = new ssm.StringParameter(
      this,
      'UnicornContractsNamespaceParam',
      {
        parameterName: '/uni-prop/UnicornContractsNamespace',
        stringValue: 'unicorn.contracts',
        description: 'Namespace for the Unicorn Contracts domain',
        simpleName: false,
      }
    );

    this.unicornPropertiesNamespace = new ssm.StringParameter(
      this,
      'UnicornPropertiesNamespaceParam',
      {
        parameterName: '/uni-prop/UnicornPropertiesNamespace',
        stringValue: 'unicorn.properties',
        description: 'Namespace for the Unicorn Properties domain',
        simpleName: false,
      }
    );

    this.unicornWebNamespace = new ssm.StringParameter(
      this,
      'UnicornWebNamespaceParam',
      {
        parameterName: '/uni-prop/UnicornWebNamespace',
        stringValue: 'unicorn.web',
        description: 'Namespace for the Unicorn Web domain',
        simpleName: false,
      }
    );
  }
}
