import { RetentionDays } from 'aws-cdk-lib/aws-logs';

import * as UnicornSharedConstruct from './constructs';

export { UnicornSharedConstruct };

export enum UNICORN_NAMESPACES {
    CONTRACTS = 'unicorn.contracts',
    PROPERTIES = 'unicorn.properties',
    WEB = 'unicorn.web',
} // should this be direct string

/** The different stages for the app. */
export enum Stage {
    local = 'local',
    dev = 'dev',
    prod = 'prod',
}

// API Contracts
// Opinionated CDK Constructs
// Use shared types instead of schemas?
// Bus to bus, lose control, source chain, pass event id from previous service
// uidv7/v8 time sortable. propid

export const isProd = (stage: Stage) => stage === Stage.prod;

export const logsRetentionPeriod = (stage: Stage) => {
    switch (stage) {
        case Stage.local:
            return RetentionDays.ONE_DAY;
        case Stage.dev:
            return RetentionDays.ONE_WEEK;
        case Stage.prod:
            return RetentionDays.TWO_WEEKS;
        default:
            return RetentionDays.ONE_DAY;
    }
};

export const eventBusName = (stage: Stage, namespace: UNICORN_NAMESPACES) => {
    switch (namespace) {
        case UNICORN_NAMESPACES.CONTRACTS:
            return `UnicornContractsBus-${stage}`; // use the
        case UNICORN_NAMESPACES.PROPERTIES:
            return `UnicornPropertiesBus-${stage}`;
        case UNICORN_NAMESPACES.WEB:
            return `UnicornWebBus-${stage}`;
        default:
            throw new Error(
                `Error generatinig Event Bus Name Unknown namespace: ${namespace}`
            );
    }
};
