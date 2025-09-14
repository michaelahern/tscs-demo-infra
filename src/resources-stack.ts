import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class TailscaleResourcesStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new dynamodb.Table(this, 'DynamoDBTable', {
            tableName: `tscs-demo-table-${this.account}-${this.region}`,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED
        });

        new s3.Bucket(this, 'S3Bucket', {
            bucketName: `tscs-demo-bucket-${this.account}-${this.region}`,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.KMS_MANAGED,
            enforceSSL: true
        });
    }
}
