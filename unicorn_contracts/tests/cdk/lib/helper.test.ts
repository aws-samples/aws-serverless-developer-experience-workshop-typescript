// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';

import {
  STAGE,
  UNICORN_NAMESPACES,
  getStageFromContext,
} from '../../../cdk/lib/helper';

describe('Helper Functions and Enums', () => {
  describe('STAGE enum', () => {
    test('has correct values', () => {
      expect(STAGE.local).toBe('local');
      expect(STAGE.dev).toBe('dev');
      expect(STAGE.prod).toBe('prod');
      expect(Object.keys(STAGE).length).toBe(3);
    });
  });

  describe('UNICORN_NAMESPACES enum', () => {
    test('has correct values', () => {
      expect(UNICORN_NAMESPACES.CONTRACTS).toBe('unicorn.contracts');
      expect(UNICORN_NAMESPACES.PROPERTIES).toBe('unicorn.properties');
      expect(UNICORN_NAMESPACES.WEB).toBe('unicorn.web');
      expect(Object.keys(UNICORN_NAMESPACES).length).toBe(3);
    });
  });

  describe('getStageFromContext', () => {
    let app: cdk.App;

    beforeEach(() => {
      app = new cdk.App();
    });

    test('returns local when no stage is provided', () => {
      expect(getStageFromContext(app)).toBe(STAGE.local);
    });

    test('returns correct stage when valid stage is provided', () => {
      app = new cdk.App({ context: { stage: 'dev' } });
      expect(getStageFromContext(app)).toBe(STAGE.dev);

      app = new cdk.App({ context: { stage: 'prod' } });
      expect(getStageFromContext(app)).toBe(STAGE.prod);
    });

    test('throws error for invalid stage', () => {
      app = new cdk.App({ context: { stage: 'invalid' } });
      expect(() => getStageFromContext(app)).toThrow(
        'Invalid stage "invalid". Must be one of: local, dev, prod'
      );
    });
  });
});
