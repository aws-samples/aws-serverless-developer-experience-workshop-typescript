import { NamespacesConstruct } from './constructs/namespaces-construct';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs'

export class UnicornNamespacesStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const namespaces = new NamespacesConstruct(this, 'Namespaces', {});

    new CfnOutput(this, 'UnicornContractsNamespace', {
      description: 'Unicorn Contracts namespace parameter',
      value: namespaces.UnicornContractsNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornPropertiesNamespace', {
      description: 'Unicorn Properties namespace parameter',
      value: namespaces.UnicornPropertiesNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornWebNamespace', {
      description: 'Unicorn Web namespace parameter',
      value: namespaces.UnicornWebNamespace.parameterName,
    });
    new CfnOutput(this, 'UnicornContractsNamespaceValue', {
      description: 'Unicorn Contracts namespace parameter value',
      value: namespaces.UnicornContractsNamespace.stringValue,
    });
    new CfnOutput(this, 'UnicornPropertiesNamespaceValue', {
      description: 'Unicorn Properties namespace parameter value',
      value: namespaces.UnicornPropertiesNamespace.stringValue,
    });
    new CfnOutput(this, 'UnicornWebNamespaceValue', {
      description: 'Unicorn Web namespace parameter value',
      value: namespaces.UnicornWebNamespace.stringValue,
    })
  }

}