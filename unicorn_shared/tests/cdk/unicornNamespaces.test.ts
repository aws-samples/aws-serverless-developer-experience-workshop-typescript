// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { UnicornNamespacesStack } from '../../cdk/unicornNamespaces';

describe('Unicorn Namespaces Stack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new UnicornNamespacesStack(app, 'UnicornNamespacesStack', {});
    template = Template.fromStack(stack);
  });

  test('Creates three SSM Parameters with correct names', () => {
    template.resourceCountIs('AWS::SSM::Parameter', 3);

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: '/uni-prop/UnicornContractsNamespace',
      Value: 'unicorn.contracts',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: '/uni-prop/UnicornPropertiesNamespace',
      Value: 'unicorn.properties',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: '/uni-prop/UnicornWebNamespace',
      Value: 'unicorn.web',
    });
  });

  test('Has correct outputs', () => {
    template.hasOutput('UnicornContractsNamespace', {
      Description: 'Unicorn Contracts namespace parameter',
    });

    template.hasOutput('UnicornPropertiesNamespace', {
      Description: 'Unicorn Properties namespace parameter',
    });

    template.hasOutput('UnicornWebNamespace', {
      Description: 'Unicorn Web namespace parameter',
    });

    template.hasOutput('UnicornContractsNamespaceValue', {
      Description: 'Unicorn Contracts namespace parameter value',
    });

    template.hasOutput('UnicornPropertiesNamespaceValue', {
      Description: 'Unicorn Properties namespace parameter value',
    });

    template.hasOutput('UnicornWebNamespaceValue', {
      Description: 'Unicorn Web namespace parameter value',
    });
  });

  test('Template matches snapshot', () => {
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('SSM Parameters have correct references in outputs', () => {
    template.hasOutput('UnicornContractsNamespaceValue', {
      Value: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('.*UnicornContractsNamespaceParam.*'),
          'Value',
        ],
      },
    });

    template.hasOutput('UnicornPropertiesNamespaceValue', {
      Value: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('.*UnicornPropertiesNamespaceParam.*'),
          'Value',
        ],
      },
    });

    template.hasOutput('UnicornWebNamespaceValue', {
      Value: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('.*UnicornWebNamespaceParam.*'),
          'Value',
        ],
      },
    });
  });
});
