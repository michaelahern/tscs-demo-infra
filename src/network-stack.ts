import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class TailscaleNetworkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'VPC', {
            ipAddresses: ec2.IpAddresses.cidr('172.24.0.0/16'),
            maxAzs: 3,
            natGateways: 0,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    cidrMask: 24,
                    name: 'PrivateIsolated',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED
                }
            ]
        });

        const ecsCluster = new ecs.Cluster(this, 'Cluster', {
            vpc: vpc,
            containerInsightsV2: ecs.ContainerInsights.ENHANCED
        });

        const ecsTaskDefinition = new ecs.FargateTaskDefinition(this, 'TailscaleTask', {
            cpu: 512,
            memoryLimitMiB: 1024,
            runtimePlatform: {
                cpuArchitecture: ecs.CpuArchitecture.ARM64,
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
            }
        });

        ecsTaskDefinition.addContainer('Tailscale', {
            image: ecs.ContainerImage.fromRegistry('ghcr.io/tailscale/tailscale:latest'),
            environment: {
                TS_ENABLE_HEALTH_CHECK: 'true',
                // TS_EXTRA_ARGS: '--advertise-exit-node --advertise-tags=tag:tscs-demo',
                TS_HOSTNAME: `tscs-demo-${this.region}`
                // TS_ROUTES: '172.24.0.0/16'
            },
            secrets: {
                TS_AUTH_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'TailscaleAuthKey', 'tailscale/tscs-demo-auth-key'))
            },
            essential: true,
            healthCheck: {
                command: [
                    'CMD-SHELL',
                    'wget --spider -q http://127.0.0.1:9002/healthz'
                ],
                interval: cdk.Duration.seconds(30),
                startPeriod: cdk.Duration.seconds(30),
                timeout: cdk.Duration.seconds(5)
            },
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'ecs',
                logRetention: cdk.aws_logs.RetentionDays.ONE_MONTH,
                mode: ecs.AwsLogDriverMode.NON_BLOCKING
            }),
            portMappings: [{
                containerPort: 9002,
                hostPort: 9002,
                protocol: ecs.Protocol.TCP
            }],
            enableRestartPolicy: true,
            restartAttemptPeriod: cdk.Duration.minutes(5)
        });

        const ecsService = new ecs.FargateService(this, 'TailscaleService', {
            cluster: ecsCluster,
            desiredCount: 1,
            maxHealthyPercent: 100,
            minHealthyPercent: 0,
            healthCheckGracePeriod: cdk.Duration.minutes(1),
            circuitBreaker: {
                enable: true
            },
            taskDefinition: ecsTaskDefinition,
            assignPublicIp: true,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }
        });

        ecsService.connections.allowInternally(ec2.Port.tcp(9002));
        ecsService.connections.allowToAnyIpv4(ec2.Port.allTraffic());
    }
}
