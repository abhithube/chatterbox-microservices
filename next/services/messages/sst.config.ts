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

    const cluster = new aws.ecs.Cluster('Cluster')

    new aws.ec2.LaunchTemplate('LaunchTemplate', {
      imageId: 'ami-0cf4e1fcfd8494d5b',
      instanceType: 't2.micro',
      securityGroupNames: [internalSecurityGroup.name],
      userData: cluster.name.apply((name) =>
        Buffer.from(
          `#!/bin/bash\necho 'ECS_CLUSTER=${name}' >> /etc/ecs/ecs.config`,
        ).toString('base64'),
      ),
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
        },
      ]),
    })

    new aws.ecs.Service('Service', {
      cluster: cluster.arn,
      taskDefinition: taskDefinition.arn,
      forceDelete: true,
    })
  },
})
