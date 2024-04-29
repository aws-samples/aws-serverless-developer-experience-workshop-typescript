import {
    // Duration,
    // RemovalPolicy,
    Stack,
    StackProps,
    App,
    CfnOutput,
    Stage,
    StageProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";

import { UnicornConstractsStack } from './unicorn-contracts-stack';
import { Stage as UnicornStage } from 'unicorn_shared';

interface UnicornContractsPipelineStackProps extends StackProps {
    stage: String;
}

class WorkshopPipelineStage extends Stage {
    public readonly hcViewerUrl: CfnOutput;
    public readonly hcEndpoint: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new UnicornConstractsStack(this, 'WebService', {stage: UnicornStage.prod});
    }
}

export class UnicornContractsPipelineStack extends Stack {
    constructor(scope: App, id: string, props: UnicornContractsPipelineStackProps) {
        super(scope, id, props);

        const repo = new Repository(this, 'WorkshopRepo', {
            repositoryName: "WorkshopRepo"
        });

        // The basic pipeline declaration. This sets the initial structure of our pipeline

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'WorkshopPipeline',
            synth: new CodeBuildStep('SynthStep', {
                // input: CodePipelineSource.codeCommit(repo, 'cdk'),
                installCommands: [
                    'npm install -g aws-cdk',
                    'npm install -g pnpm',
                ],
                commands: [
                    'cd unicorn_contracts/',
                    'pnpm install',
                    'pnpm exec cdk synth',
                ]
            }
            )
        });

        const deploy = new WorkshopPipelineStage(this, 'Deploy');
        const deployStage = pipeline.addStage(deploy);

        // deployStage.addPost(
        //     new CodeBuildStep('TestViewerEndpoint', {
        //         projectName: 'TestViewerEndpoint',
        //         envFromCfnOutputs: {
        //             ENDPOINT_URL: deploy.hcViewerUrl
        //         },
        //         commands: [
        //             'curl -Ssf $ENDPOINT_URL'
        //         ]
        //     }),
        //     new CodeBuildStep('TestAPIGatewayEndpoint', {
        //         projectName: 'TestAPIGatewayEndpoint',
        //         envFromCfnOutputs: {
        //             ENDPOINT_URL: deploy.hcEndpoint
        //         },
        //         commands: [
        //             'curl -Ssf $ENDPOINT_URL',
        //             'curl -Ssf $ENDPOINT_URL/hello',
        //             'curl -Ssf $ENDPOINT_URL/test'
        //         ]
        //     })
        // )
    }
}
