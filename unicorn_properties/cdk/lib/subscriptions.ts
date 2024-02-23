import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import {
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Stage, UNICORN_NAMESPACES, eventBusName } from 'unicorn_shared';

/*
Description: Defines the rule for the events (subscriptions) that Unicorn Properties wants to consume.
*/
interface SubscriptionsStackProps extends StackProps {
    stage: Stage;
}

export class SubscriptionsStack extends Stack {
    constructor(scope: App, id: string, props: SubscriptionsStackProps) {
        super(scope, id, props);
        const contractsEventBus = events.EventBus.fromEventBusName(
            this,
            'UnicornContractsEventBus',
            eventBusName(props.stage, UNICORN_NAMESPACES.CONTRACTS)
        );
        const propertiesEventBus = events.EventBus.fromEventBusName(
            this,
            'UnicornPropertiesEventBus',
            eventBusName(props.stage, UNICORN_NAMESPACES.CONTRACTS)
        );

        // This IAM role allows EventBridge to assume the permissions necessary to send events
        // from the publishing event bus, to the subscribing event bus (UnicornPropertiesEventBusArn)
        const unicornPropertiesSubscriptionRole = new Role(
            this,
            'UnicornPropertiesSubscriptionRole',
            {
                assumedBy: new ServicePrincipal('events.amazonaws.com'),
                roleName: `UnicornPropertiesSubscriptionRole-${this.node.addr}`,
                description: `This IAM role allows EventBridge to assume the permissions necessary to send events from the publishing event bus, to the subscribing event bus (UnicornPropertiesEventBusArn)`,
                inlinePolicies: {
                    PutEventsOnUnicornPropertiesEventBus: new PolicyDocument({
                        statements: [
                            new PolicyStatement({
                                actions: ['events:PutEvents'],
                                resources: [propertiesEventBus.eventBusArn],
                            }),
                        ],
                    }),
                },
            }
        );
        // UNICORN CONTRACTS EVENT SUBSCRIPTIONS
        const contractStatusChangedEvents = new events.Rule(
            this,
            'ContractStatusChangedSubscriptionRule',
            {
                ruleName: `unicorn.properties-ContractStatusChanged`,
                description: `Contract Status Changed subscription`,
                eventBus: contractsEventBus,
                eventPattern: {
                    source: [UNICORN_NAMESPACES.CONTRACTS],
                    detailType: ['ContractStatusChanged'],
                },
                targets: [
                    new targets.EventBus(propertiesEventBus, {
                        role: unicornPropertiesSubscriptionRole,
                    }),
                ],
            }
        );

        // UNICORN WEB EVENT SUBSCRIPTIONS
        const publicationApprovalRequestedEvents = new events.Rule(
            this,
            'PublicationApprovalRequestedSubscriptionRule',
            {
                ruleName: `unicorn.properties-PublicationApprovalRequested`,
                description: `Publication evaluation completed subscription`,
                eventBus: contractsEventBus,
                eventPattern: {
                    source: [UNICORN_NAMESPACES.WEB],
                    detailType: ['PublicationApprovalRequested'],
                },
                targets: [
                    new targets.EventBus(propertiesEventBus, {
                        role: unicornPropertiesSubscriptionRole,
                    }),
                ],
            }
        );
    }
}
