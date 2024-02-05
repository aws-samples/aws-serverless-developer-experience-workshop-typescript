
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export const UNICORN_CONTRACTS_NAMESPACE:string = "unicorn.contracts";
export const UNICORN_PROPERTIES_NAMESPACE:string = "unicorn.properties";
export const UNICORN_WEB_NAMESPACE:string = "unicorn.wev";

/** The different stages for the app. */
export enum Stage {
    local = "local",
    dev = "dev",
    prod = "prod",
}

export const isProd = (stage: Stage) => stage === Stage.prod;

export const LogsRetentionPeriod = (stage: Stage) => {
    switch (stage) {
        case Stage.local:
            return RetentionDays.ONE_DAY;
        case Stage.dev:
            return RetentionDays.ONE_WEEK;
        case Stage.prod:
            return RetentionDays.TWO_WEEKS
        default:
            return RetentionDays.ONE_DAY;

    }
}