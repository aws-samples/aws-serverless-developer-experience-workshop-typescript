// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';

import * as events from 'aws-cdk-lib/aws-events';

import { crossUniPropServiceSubscription } from '../constructs/unicorn-properties-service-subscription';
import { STAGE, UNICORN_NAMESPACES } from './helper';

interface WebToPropertiesIntegrationStackProps extends StackProps {
  stage: STAGE;
  propertiesEventBusArnParam: string;
  webEventBus: events.IEventBus;
}

export class WebToPropertiesIntegrationStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: WebToPropertiesIntegrationStackProps
  ) {
    super(scope, id, props);

    new crossUniPropServiceSubscription(
      this,
      'unicorn.web-PublicationEvaluationCompletedSubscription',
      {
        publisherEventBusArnParam: props.propertiesEventBusArnParam,
        subscriberEventBus: props.webEventBus,
        subscriptionRuleName: 'unicorn.web-PublicationEvaluationCompleted',
        subscriptionDescription:
          'Subscription to PublicationEvaluationCompleted events by the Web Service.',
        subscriptionEventPattern: {
          source: [UNICORN_NAMESPACES.PROPERTIES],
          detailType: ['PublicationEvaluationCompleted'],
        },
      }
    );
  }
}
