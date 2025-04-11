// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from './helper';

interface PropertiesToContractsIntegrationStackProps extends StackProps {
  stage: STAGE;
  contractsEventBusArnParam: string;
  propertiesEventBus: events.IEventBus;
}

export class PropertiesToContractsIntegrationStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: PropertiesToContractsIntegrationStackProps
  ) {
    super(scope, id, props);

    new crossUniPropServiceSubscription(
      this,
      'unicorn-properties-ContractStatusChangedSubscription',
      {
        publisherEventBusArnParam: props.contractsEventBusArnParam,
        subscriberEventBus: props.propertiesEventBus,
        subscriptionRuleName: 'unicorn-properties-ContractStatusChanged',
        subscriptionDescription:
          'Subscription to ContractStatusChanged events by the Properties Service.',
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.CONTRACTS],
          detailType: ['ContractStatusChanged'],
        },
      }
    );
  }
}
