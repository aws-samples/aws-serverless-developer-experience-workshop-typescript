import { Lazy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { UNICORN_NAMESPACES, Stage } from './unicorn-web-stack';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface WebIntegrationStackProps extends StackProps {
  stage: Stage;
  propertiesEventBusArnParam: string;
  webEventBus: events.IEventBus;
}

export class WebIntegrationStack extends Stack {
  constructor(scope: Construct, id: string, props: WebIntegrationStackProps) {
    super(scope, id, props);


    // Integration with Properties service
    const propertiesEventBusArn = ssm.StringParameter.valueFromLookup(this, props.propertiesEventBusArnParam)

    /**
     *  When using valueFromLookup an initial dummy-value is returned prior to the lookup being performed using AWS APIs during synthesis. 
     *  As this property supports tokens, we convert the parameter value into a token to be resolved after the lookup has been completed using Lazy.
     */
    const propertiesEventBus = events.EventBus.fromEventBusArn(this, `propertiesEventBus-${props.stage}`, Lazy.string({ produce: () => propertiesEventBusArn}))
    
    new events.Rule(this, 'unicorn.web-PublicationEvaluationCompleted', {
      ruleName: 'unicorn.web-PublicationEvaluationCompleted',
      description: 'Subscription to PublicationEvaluationCompleted events by the Web Service.',
      eventBus: propertiesEventBus,
      eventPattern: {
        source: [ UNICORN_NAMESPACES.PROPERTIES ],
        detailType: [ "PublicationEvaluationCompleted" ],
      },
      enabled: true,
      targets: [
        new targets.EventBus(props.webEventBus)
      ]
    })

  }
}