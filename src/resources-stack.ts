import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class TailscaleResourcesStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new s3.Bucket(this, 'S3Bucket', {
            bucketName: `tscs-demo-bucket-${this.account}-${this.region}`,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.KMS_MANAGED,
            enforceSSL: true
        });

        new sqs.Queue(this, 'SQSQueue', {
            queueName: `tscs-demo-queue-${this.account}-${this.region}`,
            encryption: sqs.QueueEncryption.KMS_MANAGED,
            enforceSSL: true
        });
    }
}
