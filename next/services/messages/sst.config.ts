// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

import pulumi from '@pulumi/pulumi'

export default $config({
  app(input) {
    return {
      name: 'ChatterboxMessages',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    const vpc = await aws.ec2.getVpc({
      default: true,
    })

    const subnetIds = await aws.ec2.getSubnets({
      filters: [
        {
          name: 'vpc-id',
          values: [vpc.id],
        },
      ],
    })

    const availabilityZones: string[] = []
    for (const id of subnetIds.ids) {
      const subnet = await aws.ec2.getSubnet({
        id,
      })

      availabilityZones.push(subnet.availabilityZone)
    }

    const internetSecurityGroup = new aws.ec2.SecurityGroup('Internet', {
      ingress: [
        {
          fromPort: 80,
          toPort: 80,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
        {
          fromPort: 443,
          toPort: 443,
          protocol: 'tcp',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    })

    const internalSecurityGroup = new aws.ec2.SecurityGroup('Internal', {
      ingress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          securityGroups: [internetSecurityGroup.id],
        },
      ],
      egress: [
        {
          fromPort: 0,
          toPort: 0,
          protocol: '-1',
          cidrBlocks: ['0.0.0.0/0'],
        },
      ],
    })

    const assumeRolePolicyDocument = await aws.iam.getPolicyDocument({
      statements: [
        {
          principals: [
            {
              type: 'Service',
              identifiers: ['ec2.amazonaws.com'],
            },
          ],
          actions: ['sts:AssumeRole'],
        },
      ],
    })

    const logsPolicyDocument = await aws.iam.getPolicyDocument({
      statements: [
        {
          resources: ['arn:aws:logs:*:*:*'],
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'logs:DescribeLogStreams',
          ],
        },
      ],
    })

    const role = new aws.iam.Role('Role', {
      assumeRolePolicy: assumeRolePolicyDocument.json,
    })

    const ecsPolicy = await aws.iam.getPolicy({
      name: 'AmazonEC2ContainerServiceforEC2Role',
    })

    const logsPolicy = new aws.iam.Policy('LogsPolicy', {
      policy: logsPolicyDocument.json,
    })

    new aws.iam.PolicyAttachment('ECSPolicyAttachment', {
      roles: [role],
      policyArn: ecsPolicy.arn,
    })

    new aws.iam.PolicyAttachment('LogsPolicyAttachment', {
      roles: [role],
      policyArn: logsPolicy.arn,
    })

    const instanceProfile = new aws.iam.InstanceProfile('InstanceProfile', {
      role: role.name,
    })

    const cluster = new aws.ecs.Cluster('Cluster')

    const launchTemplate = new aws.ec2.LaunchTemplate('LaunchTemplate', {
      imageId: 'ami-0cf4e1fcfd8494d5b',
      instanceType: 't2.micro',
      securityGroupNames: [internalSecurityGroup.name],
      userData: cluster.name.apply((name) =>
        Buffer.from(
          `#!/bin/bash\necho 'ECS_CLUSTER=${name}' >> /etc/ecs/ecs.config`,
        ).toString('base64'),
      ),
      iamInstanceProfile: {
        arn: instanceProfile.arn,
      },
    })

    const autoScalingGroup = new aws.autoscaling.Group('AutoScalingGroup', {
      maxSize: 2,
      minSize: 0,
      launchTemplate: {
        id: launchTemplate.id,
      },
      availabilityZones,
    })

    const capacityProvider = new aws.ecs.CapacityProvider('CapacityProvider', {
      autoScalingGroupProvider: {
        autoScalingGroupArn: autoScalingGroup.arn,
        managedScaling: {
          status: 'ENABLED',
        },
      },
    })

    new aws.ecs.ClusterCapacityProviders('ClusterCapacityProviders', {
      clusterName: cluster.name,
      capacityProviders: [capacityProvider.name],
      defaultCapacityProviderStrategies: [
        {
          capacityProvider: capacityProvider.name,
          base: 1,
          weight: 100,
        },
      ],
    })

    const loadBalancer = new aws.lb.LoadBalancer('LoadBalancer', {
      securityGroups: [internetSecurityGroup.id],
      subnets: subnetIds.ids,
    })

    const listener = new aws.lb.Listener('Listener', {
      loadBalancerArn: loadBalancer.arn,
      defaultActions: [
        {
          type: 'fixed-response',
          fixedResponse: {
            contentType: 'application/json',
            statusCode: '404',
          },
        },
      ],
      protocol: 'HTTP',
      port: 80,
    })

    const targetGroup = new aws.lb.TargetGroup('TargetGroup', {
      port: 80,
      protocol: 'HTTP',
      vpcId: vpc.id,
      healthCheck: {
        path: '/messages/health',
      },
    })

    new aws.lb.ListenerRule('ListenerRule', {
      listenerArn: listener.arn,
      actions: [
        {
          type: 'forward',
          forward: {
            targetGroups: [
              {
                arn: targetGroup.arn,
              },
            ],
          },
        },
      ],
      conditions: [
        {
          pathPattern: {
            values: ['/messages/*'],
          },
        },
      ],
    })

    const repository = new aws.ecr.Repository('Repository', {
      name: 'chatterbox-messages',
      forceDelete: true,
    })

    const taskDefinition = new aws.ecs.TaskDefinition('TaskDefinition', {
      family: 'ChatterboxMessagesECSTaskDefinition',
      memory: '64',
      containerDefinitions: pulumi.jsonStringify([
        {
          name: 'messages',
          image: repository.repositoryUrl,
          portMappings: [
            {
              containerPort: 80,
            },
          ],
          essential: true,
          environment: [
            {
              name: 'PORT',
              value: '80',
            },
          ],
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': '/chatterbox/ecs/messages',
              'awslogs-region': 'us-west-1',
              'awslogs-create-group': 'true',
              'awslogs-stream-prefix': 'messages',
            },
          },
        },
      ]),
    })

    new aws.ecs.Service('Service', {
      cluster: cluster.arn,
      taskDefinition: taskDefinition.arn,
      forceDelete: true,
      loadBalancers: [
        {
          targetGroupArn: targetGroup.arn,
          containerName: 'messages',
          containerPort: 80,
        },
      ],
    })
  },
})
