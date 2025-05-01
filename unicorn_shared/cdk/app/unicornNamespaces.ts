// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { NamespacesConstruct } from '../constructs/namespaces-construct';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class UnicornNamespacesStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const namespaces = new NamespacesConstruct(this, 'Namespaces');

    new CfnOutput(this, 'UnicornContractsNamespace', {
      description: 'Unicorn Contracts namespace parameter',
      value: namespaces.unicornContractsNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornPropertiesNamespace', {
      description: 'Unicorn Properties namespace parameter',
      value: namespaces.unicornPropertiesNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornWebNamespace', {
      description: 'Unicorn Web namespace parameter',
      value: namespaces.unicornWebNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornContractsNamespaceValue', {
      description: 'Unicorn Contracts namespace parameter value',
      value: namespaces.unicornContractsNamespace.stringValue,
    });
    new CfnOutput(this, 'UnicornPropertiesNamespaceValue', {
      description: 'Unicorn Properties namespace parameter value',
      value: namespaces.unicornPropertiesNamespace.stringValue,
    });
    new CfnOutput(this, 'UnicornWebNamespaceValue', {
      description: 'Unicorn Web namespace parameter value',
      value: namespaces.unicornWebNamespace.stringValue,
    });
  }
}
