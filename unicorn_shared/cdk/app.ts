import { AwsSolutionsChecks } from 'cdk-nag';
import { App, Aspects }from 'aws-cdk-lib'
import { UnicornNamespacesStack } from './unicornNamespaces'
import { UnicornImagesStack } from './unicornImages';

const app = new App();
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

new UnicornNamespacesStack(app, 'UnicornNamespacesStack', { 
    description: 'Global namespaces for Unicorn Properties applications and services. This only needs to be deployed once.',
})

new UnicornImagesStack(app, 'UnicornImagesStack', {
    description: 'Global namespaces for Unicorn Properties applications and services. This only needs to be deployed once.',
})

app.synth()
