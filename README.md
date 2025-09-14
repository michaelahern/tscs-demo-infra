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

Tailscale Router
 * [Tailscale Container](https://tailscale.com/kb/1282/docker) deployed to AWS ECS Fargate on the above VPC.
 * Configured as a [Subnet Router](https://tailscale.com/kb/1019/subnets) for the AWS VPC CIDR and AWS S3 CIDR's
   * S3 based on the AWS Managed com.amazonaws.us-east-2.s3 [Prefix List](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-aws-managed-prefix-lists.html)

### Resource Stack

Test resources configured with resource policies denying specific actions if aws:SourceVpce is not one of the expected VPC Endpoints configured in the Network Stack.
  * DynamoDB Table
  * KMS Key
  * S3 Bucket
