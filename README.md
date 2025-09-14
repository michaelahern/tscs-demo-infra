# Tailscale/Codespaces Cloud Native Dev Demo

A demo of using Tailscale and GitHub Codespaces for AWS cloud native development.

## Key Infrastructure

### Network Stack

VPC
 * IPv4 CIDR: 172.24.0.0/16
 * DynamoDB Interface Endpoint
 * KMS Interface Endpoint with Private DNS Enabled
 * S3 Gateway Endpoint
 * Endpoint policies configured with aws:ResourceAccount conditions for same-account resource access only.

Tailscale Router Node
 * [Tailscale Container](https://tailscale.com/kb/1282/docker): Deployed to AWS ECS Fargate on the above VPC
 * [Subnet Router](https://tailscale.com/kb/1019/subnets): Router Node configured as a subnet router for the AWS VPC CIDR and AWS S3 CIDR's
   * S3 based on the AWS Managed com.amazonaws.us-east-2.s3 [Prefix List](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-aws-managed-prefix-lists.html)
 * [DNS](https://tailscale.com/kb/1054/dns): Tailnet Split DNS for AWS VPC Resolution
   * amazonaws.com --> 172.24.0.2 (VPC Default DNS Resolver)

### Resource Stack

Test resources configured with resource policies denying specific actions if aws:SourceVpce is not one of the expected VPC Endpoints configured in the Network Stack.
  * DynamoDB Table
  * KMS Key
  * S3 Bucket
