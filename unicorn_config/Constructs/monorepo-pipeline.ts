import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";

import { Stage, UNICORN_NAMESPACES } from "../index";

interface MonorepoPipelineProps {
  stage: Stage;
  namespace: UNICORN_NAMESPACES;
  source: CodePipelineSource;
}

export class MonorepoPipelineConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: MonorepoPipelineProps
  ) {
    super(scope, id);

    // Lambda Monorepo Trigger
    // EventBus Rule
    // DLQ

    // CodePipeline
    // - Checkout Stage
    // - Build Stage
    // - Test Stage
    // - Deploy Stage
  }
}
