import * as cdk from 'aws-cdk-lib';
import { TailscaleAuthKeyStack } from './auth-key-stack.js';
import { TailscaleNetworkStack } from './network-stack.js';
import { TailscaleResourcesStack } from './resources-stack.js';

const app = new cdk.App();

new TailscaleAuthKeyStack(app, 'TSCSDemoAuthKey', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});

const networkStack = new TailscaleNetworkStack(app, 'TSCSDemoNetwork', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});

new TailscaleResourcesStack(app, 'TSCSDemoResources', networkStack, {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
