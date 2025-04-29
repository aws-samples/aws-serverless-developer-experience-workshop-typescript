// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { App } from 'aws-cdk-lib';
import { UnicornNamespacesStack } from './unicornNamespaces';
import { UnicornImagesStack } from './unicornImages';
import { STAGE } from './constructs/images-construct';

const app = new App();

new UnicornNamespacesStack(app, 'uni-prop-namespaces', {
  description:
    'Global namespaces for Unicorn Properties applications and services. This only needs to be deployed once.',
});

const _stages = [STAGE.local, STAGE.dev, STAGE.prod] as const;
_stages.forEach((stage) => {
  new UnicornImagesStack(app, `uni-prop-${stage}-shared`, {
    description:
      'Global namespaces for Unicorn Properties applications and services. This only needs to be deployed once.',
    stage,
  });
});

app.synth();
