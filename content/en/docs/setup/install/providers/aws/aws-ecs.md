---

title:  "Amazon ECS"
description: Deploy Spinnaker to ECS.
---



In the Amazon ECS cloud provider, an [Account](/docs/concepts/providers/#accounts)
maps to a Spinnaker AWS account, which itself is able to authenticate against a given [AWS
account](https://aws.amazon.com/account/).

## Prerequisites

### Amazon ECS cluster

You need to [create an Amazon ECS cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create_cluster.html). If using the 'EC2' launch type, this cluster must have enough EC2 instance capacity in it to deploy your containers.  If using the 'Fargate' launch type, you don't need to add any capacity to this cluster.

### Networking

If using the 'awsvpc' networking mode (required for the 'Fargate' launch type), you need a VPC with at least one subnet group and security group visible in Spinnaker.

If using other networking modes like 'bridge', you don't need to setup any further networking.  The cluster's networking configuration will be passed from your cluster's EC2 instances to your containers.

### Service-Linked IAM Roles

In Spinnaker versions 1.19 and later, the Amazon ECS cloud provider requires service-linked roles for Amazon ECS and Application Auto Scaling.  To create the required service-linked roles, run the following commands.

```
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
aws iam create-service-linked-role --aws-service-name ecs.application-autoscaling.amazonaws.com
```

See the [Amazon ECS service-linked role documentation](https://docs.aws.amazon.com/AmazonECS/latest/userguide/using-service-linked-roles.html) and the [Application Auto Scaling service-linked role documentation](https://docs.aws.amazon.com/autoscaling/application/userguide/application-auto-scaling-service-linked-roles.html) for information on the permissions in these roles.

### Legacy IAM Roles (prior to 1.19)

In Spinnaker versions 1.18 and below, the Amazon ECS cloud provider uses [legacy IAM roles for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-legacy-iam-roles.html).  The provider uses the cloud provider account's assumed IAM role as both the [Service Scheduler IAM role](https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-legacy-iam-roles.html#service_IAM_role) and the [Service Auto Scaling IAM role](https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-legacy-iam-roles.html#autoscale_IAM_role) for the server group's Amazon ECS service.

The IAM role for the cloud provider account associated with the Amazon ECS server group must allow both Amazon ECS and Application Auto Scaling to assume the role in its trust policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
                "Service": [
                  "ecs.amazonaws.com",
                  "application-autoscaling.amazonaws.com"
                ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

For information on how to configure the IAM role associated with the cloud provider account, see the [AWS provider documentation](/docs/setup/install/providers/aws/aws-ec2/).  For information on how to modify IAM roles in the AWS console, see the [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage_modify.html).

### Task Execution IAM Role

Some Amazon ECS services require a [task execution IAM role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html), such as services running on AWS Fargate.  If you are using task definition artifacts in your Spinnaker pipeline, the task execution role can be specified in the artifact's task definition file.

If you are not using a task definition artifact (or if the artifact's task definition file does not specify a task execution role) for a server group running on Fargate, the Amazon ECS cloud provider will fallback to using the cloud provider account's assumed IAM role as the task execution role.  In that situation, the IAM role for the cloud provider account associated with the Amazon ECS server group must allow Amazon ECS to assume the role in its trust policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
                "Service": [
                  "ecs-tasks.amazonaws.com"
                ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

For information on how to configure the IAM role associated with the cloud provider account, see the [AWS provider documentation](/docs/setup/install/providers/aws/aws-ec2/).  For information on how to modify IAM roles in the AWS console, see the [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage_modify.html).

### Optional: IAM Roles for Tasks

You can create [IAM roles for tasks](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html) and associate them to your Amazon ECS provider server group in Spinnaker, so that your application's containers have access to IAM role credentials.  The task role must allow Amazon ECS to assume the role in its trust policy.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

For information on how to modify IAM roles in the AWS console, see the [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage_modify.html).

### Optional: Service Auto Scaling

You can configure your Amazon ECS services to use [Service Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html).  Service Auto Scaling policies adjust your Amazon ECS service's desired count up or down in response to CloudWatch alarms (e.g. tracking the CPU utilization of an Amazon ECS service, or tracking a custom metric) or on a schedule (e.g. scale up on Monday, scale down on Friday).

Configure scaling policies on your Amazon ECS services using the Application Auto Scaling APIs or in the Amazon ECS console, outside of Spinnaker.  When deploying a new server group in Spinnaker, you can copy these scaling policies from the previous service group by enabling the "copy the previous server group's autoscaling policies" option.

### Halyard

Example command:
```bash
hal config provider ecs account add ecs-account-name --aws-account aws-account-name
```



In the above example, `ecs-account-name` is the name of the Amazon ECS account, and `aws-account-name` is the name of a previously added, valid AWS account.  Do note that the Amazon ECS account will use credentials from the corresponding AWS account.

#### Enable ECS Provider
Make sure that the AWS Provider is already enabled. Proceed to enable the ECS Provider with `halyard`
```bash
hal config provider ecs enable
```

### Clouddriver yaml properties

If you are not using Halyard, then you must declare Amazon ECS accounts and map them to a given AWS account by its name. Below is an example snippet you can put in `clouddriver.yml` or `clouddriver-local.yml`:

```yaml
aws:
  enabled: true

  accounts:
    - name: aws-account-name
      accountId: "123456789012"
      regions:
        - name: us-east-1
  defaultAssumeRole: role/SpinnakerManaged

ecs:
  enabled: true
  accounts:
    - name: ecs-account-name
      awsAccount: aws-account-name
```





## Next steps

Optionally, you can [set up another cloud provider](/docs/setup/install/providers/),
but otherwise you're ready to [choose an environment](/docs/setup/install/environment/)
in which to install Spinnaker.
