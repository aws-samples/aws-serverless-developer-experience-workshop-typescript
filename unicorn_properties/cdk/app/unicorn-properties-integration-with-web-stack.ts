// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from './helper';

interface PropertiesToWebIntegrationStackProps extends StackProps {
  stage: STAGE;
  webEventBusArnParam: string;
  propertiesEventBus: events.IEventBus;
}

export class PropertiesToWebIntegrationStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: PropertiesToWebIntegrationStackProps
  ) {
    super(scope, id, props);

    new crossUniPropServiceSubscription(
      this,
      'unicorn.properies-PublicationApprovalRequestedSubscription',
      {
        publisherEventBusArnParam: props.webEventBusArnParam,
        subscriberEventBus: props.propertiesEventBus,
        subscriptionRuleName:
          'unicorn.properties-PublicationApprovalRequestedSubscription',
        subscriptionDescription:
          'Subscription to PublicationApprovalRequested events by the Properties Service.',
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.WEB],
          detailType: ['PublicationApprovalRequested'],
        },
      }
    );
  }
}
