// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Lazy, Stack, StackProps } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { STAGE, UNICORN_NAMESPACES } from './helper';

interface PropertiesIntegrationStackProps extends StackProps {
  stage: STAGE;
  webEventBusArnParam: string;
  contractsEventBusArnParam: string;
  propertiesEventBus: events.IEventBus;
}

export class PropertiesIntegrationStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: PropertiesIntegrationStackProps
  ) {
    super(scope, id, props);

    // Integration with Web service
    const webEventBusArn = ssm.StringParameter.valueFromLookup(
      this,
      props.webEventBusArnParam
    );
    /**
     *  When using valueFromLookup an initial dummy-value is returned prior to the lookup being performed using AWS APIs during synthesis.
     *  As this property supports tokens, we convert the parameter value into a token to be resolved after the lookup has been completed using Lazy.
     */
    const webEventBus = events.EventBus.fromEventBusArn(
      this,
      `webEventBus-${props.stage}`,
      Lazy.string({ produce: () => webEventBusArn })
    );

    new events.Rule(this, 'unicorn.properties-PublicationApprovalRequested', {
      ruleName: 'unicorn.properties-PublicationApprovalRequested',
      description:
        'Subscription to PublicationApprovalRequested events by the Properties Service.',
      eventBus: webEventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.WEB],
        detailType: ['PublicationApprovalRequested'],
      },
      enabled: true,
      targets: [new targets.EventBus(props.propertiesEventBus)],
    });

    // Integration with Contracts service
    const contractsEventBusArn = ssm.StringParameter.valueFromLookup(
      this,
      props.contractsEventBusArnParam
    );
    /**
     *  When using valueFromLookup an initial dummy-value is returned prior to the lookup being performed using AWS APIs during synthesis.
     *  As this property supports tokens, we convert the parameter value into a token to be resolved after the lookup has been completed using Lazy.
     */
    const contractsEventBus = events.EventBus.fromEventBusArn(
      this,
      'event-bus',
      Lazy.string({ produce: () => contractsEventBusArn })
    );
    new events.Rule(this, 'unicorn-properties-ContractStatusChanged', {
      ruleName: 'unicorn.properties-ContractStatusChanged',
      description:
        'Subscription to ContractStatusChanged events by the Properties Service.',
      eventBus: contractsEventBus,
      eventPattern: {
        source: [UNICORN_NAMESPACES.CONTRACTS],
        detailType: ['ContractStatusChanged'],
      },
      enabled: true,
      targets: [new targets.EventBus(props.propertiesEventBus)],
    });
  }
}
