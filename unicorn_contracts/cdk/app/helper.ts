// helper.ts
import { App } from 'aws-cdk-lib';

export enum Stage {
    local = 'local',
    dev = 'dev',
    prod = 'prod',
}

export enum UNICORN_NAMESPACES {
    CONTRACTS = 'unicorn.contracts',
    PROPERTIES = 'unicorn.properties',
    WEB = 'unicorn.web',
}

const isValidStage = (stage: any): stage is Stage => 
    Object.values(Stage).includes(stage);

export const getStageFromContext = (app: App): Stage => {
    const stageFromContext = app.node.tryGetContext('stage');
    
    if (stageFromContext) {
        if (!isValidStage(stageFromContext)) {
            throw new Error(
                `Invalid stage "${stageFromContext}". Must be one of: ${Object.values(Stage).join(', ')}`
            );
        }
        return stageFromContext;
    }
    
    return Stage.local;
};
