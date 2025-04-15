// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {
  STAGE,
  UNICORN_NAMESPACES,
  getStageFromContext,
  getDefaultLogsRetentionPeriod,
  LambdaHelper,
} from '../../../cdk/constructs/helper';

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

  describe('getDefaultLogsRetentionPeriod', () => {
    test('returns correct retention period for each stage', () => {
      expect(getDefaultLogsRetentionPeriod(STAGE.local)).toBe(
        logs.RetentionDays.ONE_DAY
      );
      expect(getDefaultLogsRetentionPeriod(STAGE.dev)).toBe(
        logs.RetentionDays.ONE_WEEK
      );
      expect(getDefaultLogsRetentionPeriod(STAGE.prod)).toBe(
        logs.RetentionDays.TWO_WEEKS
      );
    });

    test('returns ONE_DAY when no stage is provided', () => {
      expect(getDefaultLogsRetentionPeriod()).toBe(logs.RetentionDays.ONE_DAY);
    });

    test('returns ONE_DAY for undefined stage', () => {
      expect(getDefaultLogsRetentionPeriod(undefined)).toBe(
        logs.RetentionDays.ONE_DAY
      );
    });
  });

  describe('LambdaHelper', () => {
    describe('defaultLambdaOptions', () => {
      test('has correct default values', () => {
        const options = LambdaHelper.defaultLambdaOptions;
        // expect(options.runtime.name).toBe('nodejs20.x');
        expect(options.handler).toBe('lambdaHandler');
        expect(options.tracing).toBe(cdk.aws_lambda.Tracing.ACTIVE);
        expect(options.memorySize).toBe(128);
        expect(options.timeout?.toSeconds()).toBe(15);
        expect(options.architecture).toBe(cdk.aws_lambda.Architecture.X86_64);
      });
    });

    describe('getDefaultEnvironmentVariables', () => {
      let mockTable: dynamodb.ITableV2;

      beforeEach(() => {
        // Create a mock DynamoDB table
        const stack = new cdk.Stack();
        mockTable = new dynamodb.TableV2(stack, 'MockTable', {
          partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        });
      });

      test('returns correct env vars for dev stage', () => {
        const envVars = LambdaHelper.getDefaultEnvironmentVariables({
          table: mockTable,
          stage: STAGE.dev,
        });

        expect(envVars).toEqual({
          DYNAMODB_TABLE: mockTable.tableName,
          SERVICE_NAMESPACE: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_SERVICE_NAME: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_TRACE_DISABLED: 'false',
          POWERTOOLS_LOGGER_LOG_EVENT: 'true',
          POWERTOOLS_LOGGER_SAMPLE_RATE: '0.1',
          POWERTOOLS_METRICS_NAMESPACE: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_LOG_LEVEL: 'INFO',
          LOG_LEVEL: 'INFO',
          NODE_OPTIONS: '--enable-source-maps',
        });
      });

      test('returns correct env vars for prod stage', () => {
        const envVars = LambdaHelper.getDefaultEnvironmentVariables({
          table: mockTable,
          stage: STAGE.prod,
        });

        expect(envVars).toEqual({
          DYNAMODB_TABLE: mockTable.tableName,
          SERVICE_NAMESPACE: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_LOGGER_CASE: 'PascalCase',
          POWERTOOLS_SERVICE_NAME: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_TRACE_DISABLED: 'false',
          POWERTOOLS_LOGGER_LOG_EVENT: 'false',
          POWERTOOLS_LOGGER_SAMPLE_RATE: '0',
          POWERTOOLS_METRICS_NAMESPACE: UNICORN_NAMESPACES.WEB,
          POWERTOOLS_LOG_LEVEL: 'INFO',
          LOG_LEVEL: 'INFO',
          NODE_OPTIONS: '',
        });
      });

      test('includes table name from provided table', () => {
        const envVars = LambdaHelper.getDefaultEnvironmentVariables({
          table: mockTable,
          stage: STAGE.dev,
        });

        expect(envVars.DYNAMODB_TABLE).toBe(mockTable.tableName);
      });
    });
  });
});
