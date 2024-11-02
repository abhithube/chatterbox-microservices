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
    const cluster = new aws.ecs.Cluster('Cluster')

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
