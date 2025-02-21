import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class NamespacesConstruct extends Construct {

  public readonly UnicornContractsNamespace: ssm.StringParameter;
  public readonly UnicornPropertiesNamespace: ssm.StringParameter;
  public readonly UnicornWebNamespace: ssm.StringParameter;

  constructor(
    scope: Construct,
    id: string,
    props: {}
  ) {
    super(scope, id);

    this.UnicornContractsNamespace = new ssm.StringParameter(this, 'UnicornContractsNamespaceParam', {
      parameterName: '/uni-prop/UnicornContractsNamespace',
      stringValue: 'unicorn.contracts',
      description: 'Namespace for the Unicorn Contracts domain',
      simpleName: false,
    }); 

    this.UnicornPropertiesNamespace = new ssm.StringParameter(this, 'UnicornPropertiesNamespaceParam', {
      parameterName: '/uni-prop/UnicornPropertiesNamespace',
      stringValue: 'unicorn.properties',
      description: 'Namespace for the Unicorn Properties domain',
      simpleName: false,
    });

    this.UnicornWebNamespace = new ssm.StringParameter(this, 'UnicornWebNamespaceParam', {
      parameterName: '/uni-prop/UnicornWebNamespace',
      stringValue: 'unicorn.web',
      description: 'Namespace for the Unicorn Web domain',
      simpleName: false,
    })
  }

}