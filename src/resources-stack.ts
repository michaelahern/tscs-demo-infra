import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { TailscaleNetworkStack } from './network-stack.js';

export class TailscaleResourcesStack extends cdk.Stack {
    constructor(scope: Construct, id: string, networkStack: TailscaleNetworkStack, props?: cdk.StackProps) {
        super(scope, id, props);

        new dynamodb.Table(this, 'DynamoDBTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            tableName: `tscs-demo-table-${this.account}-${this.region}`,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            resourcePolicy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.DENY,
                        principals: [new iam.AnyPrincipal()],
                        actions: [
                            'dynamodb:PutItem'
                        ],
                        resources: ['*'],
                        conditions: {
                            StringNotEquals: {
                                'aws:sourceVpce': networkStack.dynamoDbEndpoint.vpcEndpointId
                            }
                        }
                    })
                ]
            })
        });

        new kms.Key(this, 'KMSKey', {
            alias: `tscs-demo-key-${this.account}-${this.region}`,
            policy: new iam.PolicyDocument({
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        principals: [new iam.AccountRootPrincipal()],
                        actions: ['kms:*'],
                        resources: ['*']
                    }),
                    new iam.PolicyStatement({
                        effect: iam.Effect.DENY,
                        principals: [new iam.AnyPrincipal()],
                        actions: [
                            'kms:Encrypt',
                            'kms:Decrypt',
                            'kms:ReEncrypt*',
                            'kms:GenerateDataKey*'
                        ],
                        resources: ['*'],
                        conditions: {
                            StringNotEquals: {
                                'aws:sourceVpce': networkStack.kmsEndpoint.vpcEndpointId
                            }
                        }
                    })
                ]
            }),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            pendingWindow: cdk.Duration.days(7)
        });

        new s3.Bucket(this, 'S3Bucket', {
            bucketName: `tscs-demo-bucket-${this.account}-${this.region}`,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.KMS_MANAGED,
            enforceSSL: true,
            minimumTLSVersion: 1.2
        }).addToResourcePolicy(new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            principals: [new iam.AnyPrincipal()],
            actions: [
                's3:PutObject'
            ],
            resources: [`arn:aws:s3:::tscs-demo-bucket-${this.account}-${this.region}/*`],
            conditions: {
                StringNotEquals: {
                    'aws:sourceVpce': networkStack.s3Endpoint.vpcEndpointId
                }
            }
        }));
    }
}
