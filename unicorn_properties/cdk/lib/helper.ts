// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

/**
 * Deployment stages for the application
 * @enum {string}
 */
export enum STAGE {
  /** Local development environment */
  local = 'local',
  /** Development environment */
  dev = 'dev',
  /** Production environment */
  prod = 'prod',
}

/**
 * Service namespaces for different components of the Unicorn Properties application
 * @enum {string}
 */
export enum UNICORN_NAMESPACES {
  /** Namespace for contract-related services */
  CONTRACTS = 'unicorn.contracts',
  /** Namespace for property-related services */
  PROPERTIES = 'unicorn.properties',
  /** Namespace for web-related services */
  WEB = 'unicorn.web',
}

/**
 * Type guard to check if a value is a valid STAGE
 * @param stage - Value to check against STAGE enum
 * @returns {boolean} True if the value is a valid STAGE
 *
 * @example
 * ```typescript
 * const isValid = isValidStage('dev'); // returns true
 * const isInvalid = isValidStage('test'); // returns false
 * ```
 */
const isValidStage = (stage: any): stage is STAGE =>
  Object.values(STAGE).includes(stage);

/**
 * Retrieves the deployment stage from CDK context, defaulting to 'local' if not specified
 * @param app - The CDK App instance
 * @returns {STAGE} The deployment stage
 * @throws {Error} If the stage from context is not a valid STAGE value
 *
 * @example
 * ```typescript
 * const app = new cdk.App();
 * const stage = getStageFromContext(app);
 *
 * // With context -c stage=dev
 * // Returns STAGE.dev
 *
 * // Without context
 * // Returns STAGE.local
 *
 * // With invalid stage -c stage=invalid
 * // Throws Error: Invalid stage "invalid". Must be one of: local, dev, prod
 * ```
 */
export const getStageFromContext = (app: cdk.App): STAGE => {
  const stageFromContext = app.node.tryGetContext('stage');

  if (stageFromContext) {
    if (!isValidStage(stageFromContext)) {
      throw new Error(
        `Invalid stage "${stageFromContext}". Must be one of: ${Object.values(
          STAGE
        ).join(', ')}`
      );
    }
    return stageFromContext;
  }

  return STAGE.local;
};

/**
 * Helper class providing utility methods for AWS CDK stack operations
 */
export class StackHelper {
  /**
   * Creates a CloudFormation output with standardized formatting
   */
  public static createOutput(
    scope: cdk.Stack,
    props: {
      /** Name to be used for export/key and construct ID (if id not provided) */
      name: string;
      /** Value of the output */
      value: string;
      /** Stage of the stack this output is in */
      stage: STAGE;
      /** Optional description of the output */
      description?: string;
      /** Optional flag to determine if name should be used as exportName (default: false) */
      export?: boolean;
      /** Optional flag to create SSM Parameter (default: false) */
      createSsmStringParameter?: boolean;
    },
    id?: string
  ): { output: cdk.CfnOutput; parameter?: ssm.StringParameter } {
    // Create the CloudFormation output
    const output = new cdk.CfnOutput(scope, id ?? props.name, {
      value: props.value,
      [props.export ? 'exportName' : 'key']: props.name,
      ...(props.description && { description: props.description }),
    });

    let parameter: ssm.StringParameter | undefined;

    // Create SSM Parameter if requested
    if (props.createSsmStringParameter) {
      const parameterProps: ssm.StringParameterProps = {
        parameterName: `/uni-prop/${props.stage}/${props.name}`,
        stringValue: props.value,
        ...(props.description && { description: props.description }),
      };
      parameter = parameter = new ssm.StringParameter(
        scope,
        `/uni-prop/${props.stage}/${props.name}Parameter`,
        parameterProps
      );
    }

    return { output, parameter };
  }

  public static lookupSsmParameter(
    scope: cdk.Stack,
    /** Name to be used for ParameterName and construct Id */
    name: string
  ): string {
    const parameter = ssm.StringParameter.fromStringParameterName(
      scope,
      name,
      name
    );
    return parameter.stringValue;
  }

  /**
   * Adds standard tags to a CDK stack
   */
  public static addStackTags(
    scope: cdk.Stack,
    props: {
      /** The namespace tag value */
      namespace: UNICORN_NAMESPACES;
      /** The stage tag value */
      stage: STAGE;
      /** Optional project tag value */
      project?: string;
    }
  ): void {
    cdk.Tags.of(scope).add('namespace', props.namespace);
    cdk.Tags.of(scope).add('stage', props.stage);
    cdk.Tags.of(scope).add(
      'project',
      props.project ?? 'AWS Serverless Developer Experience'
    );
  }
}

interface LambdaOptionsProps {
  table: dynamodb.ITableV2;
  stage: STAGE;
  serviceNamespace: UNICORN_NAMESPACES;
}

/**
 * Helper class providing default configurations for Lambda functions
 */
export class LambdaHelper {
  /**
   * Default NodeJS Lambda function properties with standardized settings
   * @example
   * ```typescript
   * new nodejs.NodejsFunction(this, 'MyFunction', {
   *   ...LambdaHelper.defaultLambdaOptions,
   *   entry: 'path/to/handler.ts'
   * });
   * ```
   */
  public static readonly defaultLambdaOptions: nodejs.NodejsFunctionProps = {
    runtime: lambda.Runtime.NODEJS_20_X,
    handler: 'lambdaHandler',
    tracing: lambda.Tracing.ACTIVE,
    memorySize: 128,
    timeout: cdk.Duration.seconds(15),
    architecture: lambda.Architecture.X86_64,
  };
  /**
   * Returns the default environment variables for Lambda functions
   * @param props - Configuration properties including DynamoDB table and stage
   * @param props.table - DynamoDB table reference
   * @param props.stage - Deployment stage
   * @returns {Record<string, string>} Environment variables configuration
   *
   * @example
   * ```typescript
   * const envVars = LambdaHelper.getDefaultEnvironmentVariables({
   *   table: myDynamoTable,
   *   stage: STAGE.dev
   * });
   *
   * new nodejs.NodejsFunction(this, 'MyFunction', {
   *   ...LambdaHelper.getDefaultLambdaOptions(),
   *   environment: envVars,
   *   entry: 'path/to/handler.ts'
   * });
   * ```
   *
   * Environment variables set:
   * - DYNAMODB_TABLE: DynamoDB table name
   * - SERVICE_NAMESPACE: Web service namespace
   * - POWERTOOLS_LOGGER_CASE: PascalCase
   * - POWERTOOLS_SERVICE_NAME: Web service name
   * - POWERTOOLS_TRACE_DISABLED: Tracing configuration
   * - POWERTOOLS_LOGGER_LOG_EVENT: Enabled for non-prod stages
   * - POWERTOOLS_LOGGER_SAMPLE_RATE: 0.1 for non-prod, 0 for prod
   * - POWERTOOLS_METRICS_NAMESPACE: Web metrics namespace
   * - POWERTOOLS_LOG_LEVEL: INFO
   * - LOG_LEVEL: INFO
   * - NODE_OPTIONS: Source maps enabled for non-prod stages
   */
  public static getDefaultEnvironmentVariables(
    props: LambdaOptionsProps
  ): Record<string, string> {
    return {
      DYNAMODB_TABLE: props.table.tableName,
      SERVICE_NAMESPACE: props.serviceNamespace,
      POWERTOOLS_LOGGER_CASE: 'PascalCase',
      POWERTOOLS_SERVICE_NAME: props.serviceNamespace,
      POWERTOOLS_TRACE_DISABLED: 'false', // Explicitly disables tracing, default
      POWERTOOLS_LOGGER_LOG_EVENT: String(props.stage !== 'prod'),
      POWERTOOLS_LOGGER_SAMPLE_RATE: props.stage !== 'prod' ? '0.1' : '0', // Debug log sampling percentage, default
      POWERTOOLS_METRICS_NAMESPACE: props.serviceNamespace,
      POWERTOOLS_LOG_LEVEL: 'INFO', // Log level for Logger (INFO, DEBUG, etc.), default
      LOG_LEVEL: 'INFO', // Log level for Logger
      NODE_OPTIONS: props.stage === 'prod' ? '' : '--enable-source-maps',
    };
  }
}

/**
 * Returns the CloudWatch Logs retention period based on the deployment stage.
 * If no stage is provided, defaults to ONE_DAY retention.
 * @param stage - Optional deployment stage of the application
 * @returns {logs.RetentionDays} The retention period for CloudWatch Logs
 *
 * @example
 * ```typescript
 * // With specific stage
 * const stage = getStageFromContext(app);
 * const retention = getLogsRetentionPeriod(stage);
 *
 * // With default retention (ONE_DAY)
 * const defaultRetention = getLogsRetentionPeriod();
 *
 * new logs.LogGroup(this, 'MyLogGroup', {
 *   retention: retention
 * });
 * ```
 *
 * Retention periods per stage:
 * - local: ONE_DAY
 * - dev: ONE_WEEK
 * - prod: TWO_WEEKS
 * - undefined: ONE_DAY (default)
 */
export const getDefaultLogsRetentionPeriod = (
  stage?: STAGE
): logs.RetentionDays => {
  switch (stage) {
    case STAGE.local:
      return logs.RetentionDays.ONE_DAY;
    case STAGE.dev:
      return logs.RetentionDays.ONE_WEEK;
    case STAGE.prod:
      return logs.RetentionDays.TWO_WEEKS;
    default:
      return logs.RetentionDays.ONE_DAY;
  }
};
