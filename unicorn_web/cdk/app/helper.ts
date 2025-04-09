// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { App } from 'aws-cdk-lib';

export enum STAGE {
  local = 'local',
  dev = 'dev',
  prod = 'prod',
}

export enum UNICORN_NAMESPACES {
  CONTRACTS = 'unicorn.contracts',
  PROPERTIES = 'unicorn.properties',
  WEB = 'unicorn.web',
}

const isValidStage = (stage: any): stage is STAGE =>
  Object.values(STAGE).includes(stage);

export const getStageFromContext = (app: App): STAGE => {
  const stageFromContext = app.node.tryGetContext('stage');

  if (stageFromContext) {
    if (!isValidStage(stageFromContext)) {
      throw new Error(
        `Invalid stage "${stageFromContext}". Must be one of: ${Object.values(STAGE).join(', ')}`
      );
    }
    return stageFromContext;
  }

  return STAGE.local;
};
