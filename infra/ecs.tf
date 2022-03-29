resource "aws_ecs_capacity_provider" "main" {
  name = "ChatterboxECSCapacityProvider"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.main.arn
    managed_termination_protection = "DISABLED"

    managed_scaling {
      status = "ENABLED"
    }
  }
}

resource "aws_ecs_cluster" "main" {
  name               = var.ecs_cluster_name
  capacity_providers = [aws_ecs_capacity_provider.main.name]
}

### Accounts

resource "aws_ecs_task_definition" "accounts" {
  family = "ChatterboxAccountsECSTaskDefinition"
  cpu    = 128
  memory = 64

  container_definitions = jsonencode([
    {
      name  = "accounts"
      image = "abhithube/chatterbox-accounts"
      portMappings = [
        {
          containerPort = 80
        }
      ]
      essential = true
      environment = [
        {
          name  = "BROKER_URLS",
          value = var.common_config.broker_urls
        },
        {
          name  = "CLIENT_URL",
          value = var.common_config.client_url
        },
        {
          name  = "DATABASE_URL",
          value = var.accounts_secrets.database_url
        },
        {
          name  = "GITHUB_CLIENT_ID",
          value = var.accounts_config.github_client_id
        },
        {
          name  = "GITHUB_CLIENT_SECRET",
          value = var.accounts_secrets.github_client_secret
        },
        {
          name  = "GOOGLE_CLIENT_ID",
          value = var.accounts_config.google_client_id
        },
        {
          name  = "GOOGLE_CLIENT_SECRET",
          value = var.accounts_secrets.google_client_secret
        },
        {
          name  = "GOOGLE_OAUTH_CALLBACK_URL",
          value = var.accounts_config.google_oauth_callback_url
        },
        {
          name  = "JWT_SECRET",
          value = var.common_secrets.jwt_secret
        },
        {
          name  = "KAFKA_PASS",
          value = var.common_secrets.kafka_pass
        },
        {
          name  = "KAFKA_USER",
          value = var.common_config.kafka_user
        },
        {
          name  = "NODE_ENV",
          value = var.common_config.node_env
        },
        {
          name  = "PORT",
          value = var.common_config.port
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group        = "/chatterbox/ecs/accounts-service",
          awslogs-region       = "us-west-1",
          awslogs-create-group = "true",
          awslogs-stream-prefix = "accounts-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "accounts" {
  name                 = "ChatterboxAccountsECSService"
  cluster              = aws_ecs_cluster.main.id
  desired_count        = 1
  launch_type          = "EC2"
  task_definition      = aws_ecs_task_definition.accounts.arn
  force_new_deployment = true

  load_balancer {
    target_group_arn = aws_lb_target_group.accounts.arn
    container_name   = "accounts"
    container_port   = 80
  }

}

### Messages

resource "aws_ecs_task_definition" "messages" {
  family = "ChatterboxMessagesECSTaskDefinition"
  cpu    = 128
  memory = 64

  container_definitions = jsonencode([
    {
      name  = "messages"
      image = "abhithube/chatterbox-messages"
      portMappings = [
        {
          containerPort = 80
        }
      ]
      essential = true
      environment = [
        {
          name  = "BROKER_URLS",
          value = var.common_config.broker_urls
        },
        {
          name  = "CLIENT_URL",
          value = var.common_config.client_url
        },
        {
          name  = "DATABASE_URL",
          value = var.messages_secrets.database_url
        },
        {
          name  = "JWT_SECRET",
          value = var.common_secrets.jwt_secret
        },
        {
          name  = "KAFKA_PASS",
          value = var.common_secrets.kafka_pass
        },
        {
          name  = "KAFKA_USER",
          value = var.common_config.kafka_user
        },
        {
          name  = "NODE_ENV",
          value = var.common_config.node_env
        },
        {
          name  = "PORT",
          value = var.common_config.port
        },
        {
          name  = "REDIS_URL",
          value = var.messages_secrets.redis_url
        },
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group        = "/chatterbox/ecs/messages-service",
          awslogs-region       = "us-west-1",
          awslogs-create-group = "true",
          awslogs-stream-prefix = "messages-service"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "messages" {
  name                 = "ChatterboxMessagesECSService"
  cluster              = aws_ecs_cluster.main.id
  desired_count        = 1
  launch_type          = "EC2"
  task_definition      = aws_ecs_task_definition.messages.arn
  force_new_deployment = true

  load_balancer {
    target_group_arn = aws_lb_target_group.messages.arn
    container_name   = "messages"
    container_port   = 80
  }
}
