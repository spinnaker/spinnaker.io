---
title: "Amazon EC2"
description: Deploy Spinnaker to Amazon EC2.
---

> An older doc is available that has some information around installing
> spinnaker but is no longer recommended nor supported
> [AWS tutorial: Continuous Delivery using Spinnaker on Amazon EKS](https://aws.amazon.com/blogs/opensource/continuous-delivery-spinnaker-amazon-eks/).

The AWS EC2 Provider allows you to deploy AWS EC2 resources with Spinnaker. The most
common use case is the creation of AMIs and deploying the AMI's to new autoscaling groups
and then deleting the previous autoscaling groups.

Refer to the [AWS Cloud Provider Overview](https://spinnaker.io/setup/install/providers/aws/) to
understand how AWS IAM must be set up with the Spinnaker AWS EC2 provider. It's recommended to use
node/pod roles to access AWS services and resources securely.

## Creating the IAM structure with the AWS IAM Console

In [AWS](https://aws.amazon.com/), an [Account](/docs/concepts/providers/#accounts)
maps to a credential able to authenticate against a given [AWS account](https://aws.amazon.com/account/).
For the example below, the AWS Account **spinnaker** assumes the **spinnakerManaged** role in the
AWS accounts **develop** and **staging**. The account **spinnaker** is where Spinnaker
runs.

![Example AWS IAM structure for Spinnaker AWS Provider](/docs/setup/install/providers/aws/example-aws-provider.svg)

Before you start, create a table that maps the account names to account IDs for your desired set up. An example table is
shown:

| Name      | Account Id   |
|-----------|--------------|
| spinnaker | 100000000001 |
| develop   | 200000000002 |
| staging   | 300000000003 |

These examples are used in the subsequent sections.

> For IAM, you can either create IAM users or roles but it is recommended to use 
> IAM roles. To use a user, you'll do the same as roles but use access key and secrets 
> to set the configuration information. This option is not recommended but many users start 
> with an IAM User for simplicity.
> 1. Navigate to the AWS IAM console.
> 2. Switch to the **spinnaker** AWS Account.
> 3. Add a user and name it **spinnaker**.
> 4. Check the “Programmatic access” checkbox.
> 5. Create the user.
> 6. Save the “Access key ID” and “Secret access key” as you'll set these in spinnaker
> 
> This can be used for target accounts as well as spinnaker itself. The rest of this
> documentation will assume you are using roles going forward.  For settings
> on the aws account to use a USER, see the [configuration properties file](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-aws/src/main/java/com/netflix/spinnaker/clouddriver/aws/security/config/CredentialsConfig.java#L180-L194)
> NOTE:  This is for spinnaker itself, NOT target accounts.  For more information, please join slack and ask questions in the #sig-aws channel

## Create Roles

Setup two roles:

* **Spinnaker** role that spinnaker will operate as it's primary role. This role should
  have the necessary permissions to assume into other roles as well as any additional
  access LIKE IAM Permissions for S3 for canary storage or similar.
* **spinnakerManaged** role. This is the role the **Spinnaker** role will assume in the
  **develop** and **staging** target AWS accounts using AWS trust relationships to do deployments.

### Role for spinnaker

1. Navigate to the AWS IAM console.
2. Switch to the AWS Account where spinnaker runs.
3. Go to **Roles > Create Role**.
4. Select EC2 for the trust relationship. Spinnaker will assume this role and it's assumed
that spinnaker is running on the nodes where this role will be assigned.  For more advanced
configurations, see AWS docs on pod identity or IRSA configurations.

#### AWS Policy for Spinnaker

The AWS IAM policy gives permissions to the **spinnaker** role to assume the **spinnakerManaged** roles in
target accounts (**develop** and **staging**). Additional permissions LIKE S3 will be necessary depending 
upon features enabled in spinnaker

1. Select the AWS account where Spinnaker runs.
2. Access AWS IAM console.
3. Add a policy using the following JSON:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "ec2:DescribeAvailabilityZones",
                   "ec2:DescribeRegions"
               ],
               "Resource": [
                   "*"
               ]
           },
           {
               "Action": "sts:AssumeRole",
               "Resource": ["*"],
               "Effect": "Allow"
           }
       ]
   }
   ```
   Note that this policy has access to EC2 for listing regions for startup.  Additionally,
   the AssumeRole allows spinnaker to assume into ANY target account.  This can enable a 
   dynamic account setup. 
4. Give the policy a descriptive name, such as **SpinnakerPermissions**.
5. Create the policy.

#### Additional Permissions
Additional permissions for bake operations are needed if you plan to have spinnaker 
create AMIs.  These can be assigned to rosco via service accounts and IRSA to reduce
permissions scope.

{% collapsible "Packer Permissions Example" %}

##### Example policy for packer

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PackerEC2InstanceLifecycle",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:StopInstances",
        "ec2:StartInstances",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:DescribeInstances",
        "ec2:DescribeImages",
        "ec2:DescribeAmiAttribute",
        "ec2:DescribeRegions",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs",
        "ec2:DescribeKeyPairs",
        "ec2:CreateKeyPair",
        "ec2:DeleteKeyPair"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PackerImageManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateImage",
        "ec2:DeregisterImage",
        "ec2:ModifyImageAttribute",
        "ec2:ResetImageAttribute"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PackerVolumeManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateVolume",
        "ec2:DeleteVolume",
        "ec2:DescribeVolumes",
        "ec2:AttachVolume",
        "ec2:DetachVolume"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PackerSnapshotManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateSnapshot",
        "ec2:DeleteSnapshot",
        "ec2:DescribeSnapshots"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PackerSecurityGroupManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:DescribeSecurityGroups",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress"
      ],
      "Resource": "*"
    }
  ]
}
```

{% endcollapsible %}


#### Create Managed Roles in each target AWS Account

Next, create the **spinnakerManaged** role in the **develop ID=200000000002** and 
**staging ID=300000000003** accounts.  

1. Navigate to the AWS IAM console.
2. Switch to the AWS Account you want to create the role for.
3. Go to **Roles > Create Role**.
4. Select "Custom Trust Policy".  Use the following JSON:
```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": [
             "arn:aws:iam::100000000001:role/spinnaker"
           ]
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
```
5. Click next to add permissions.  For permissions, search for "PowerUserAccess" and select this 
policy. This gives the role permission to access MOST aws resources.  More scoped permissions
CAN be set as needed.
6. Add tags that will help you identify this role.
7. Enter a role name: spinnakerManaged.
8. Create the role.
9. Select the role and add an inline policy allow spinnaker to pass roles and get cert information.  This isn't
by default included in the PowerUserAccess permission.
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Action": [
                   "iam:ListServerCertificates",
                   "iam:PassRole"
               ],
               "Resource": [
                   "*"
               ],
               "Effect": "Allow"
           }
       ]
   }
   ```

10. Name the policy "PassRole-and-Certificates".
11. Create the policy.

Repeat these steps for the second AWS account. In this example, that is the **staging** environment.

## Spinnaker Configuration

After the AWS IAM structure has been set up, the next step is to add the accoounts
to spinnaker to allow it to deploy to these accounts.  

### Enable the AWS provider
In the clouddriver config [example here](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/base/clouddriver/files/clouddriver.yml)
add a section;

```yaml
aws:
  enabled: true
  primaryAccount: develop
  accounts:
  - name: develop
    environment: something
    defaultKeyPair: keypairs
    permissions:
      READ: 
      - groupone
      WRITE:
      - groupone
    assumeRole: role/spinnakerManaged
    accountId: 200000000002
    regions:
    - us-east-1
    - us-west-2
```
### Setup orca
You'll also need to set a default bake account in the orca config file that has to match one of the above
accounts:
```yaml
default:
  bake:
    account: develop
```

For information about the available parameters, see the source
code on an [assumed role account](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-aws/src/main/java/com/netflix/spinnaker/clouddriver/aws/security/NetflixAssumeRoleAmazonCredentials.java)

### Additional feature config for AWS provider

We recommend enabling [AWS Launch Templates](https://docs.aws.amazon.com/autoscaling/ec2/userguide/LaunchTemplates.html)
for your autoscaling groups to get the latest EC2 features. You can learn how to enable this within
the [Launch Template Setup Guide](/docs/setup/other_config/features/aws-launch-templates).

## Next steps

Optionally, you can enable other AWS Providers:

* [Manage containers in AWS ECS with Spinnaker](/docs/setup/install/providers/aws/aws-ecs/)
* [Manage containers in AWS EKS with Spinnaker](https://aws.amazon.com/eks/)
* [Enable AWS Lambda support with Spinnaker](https://aws.amazon.com/lambda/)
* [Set up another cloud provider](/docs/setup/install/providers/)

Otherwise you are ready to [choose an environment](/docs/setup/install/environment/)
in which to install Spinnaker.
