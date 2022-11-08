resource "aws_ecs_cluster" "main" {
  name = "ChatterboxECSCluster"
}

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

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name        = aws_ecs_cluster.main.name
  capacity_providers  = [aws_ecs_capacity_provider.main.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.main.name
    weight            = 100
    base              = 1
  }
}

### Accounts

resource "aws_ecs_task_definition" "accounts" {
  family = "ChatterboxAccountsECSTaskDefinition"
  cpu    = 128
  memory = 64

  container_definitions = jsonencode([
    {
      name  = "accounts"
      image = aws_ecr_repository.accounts.repository_url
      portMappings = [
        {
          containerPort = 80
        }
      ]
      essential = true
      environment = [
        {
          name  = "BROKER_URLS",
          value = var.broker_urls
        },
        {
          name  = "CLIENT_URL",
          value = var.client_url
        },
        {
          name  = "ACCOUNTS_DATABASE_URL",
          value = var.accounts_database_url
        },
        {
          name  = "GITHUB_CLIENT_ID",
          value = var.github_client_id
        },
        {
          name  = "GITHUB_CLIENT_SECRET",
          value = var.github_client_secret
        },
        {
          name  = "GOOGLE_CLIENT_ID",
          value = var.google_client_id
        },
        {
          name  = "GOOGLE_CLIENT_SECRET",
          value = var.google_client_secret
        },
        {
          name  = "GOOGLE_OAUTH_CALLBACK_URL",
          value = var.google_oauth_callback_url
        },
        {
          name  = "JWT_SECRET",
          value = var.jwt_secret
        },
        {
          name  = "KAFKA_PASS",
          value = var.kafka_pass
        },
        {
          name  = "KAFKA_USER",
          value = var.kafka_user
        },
        {
          name  = "NODE_ENV",
          value = var.node_env
        },
        {
          name  = "PORT",
          value = var.port
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/chatterbox/ecs/accounts-service",
          awslogs-region        = "us-west-1",
          awslogs-create-group  = "true",
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
      image = aws_ecr_repository.messages.repository_url
      portMappings = [
        {
          containerPort = 80
        }
      ]
      essential = true
      environment = [
        {
          name  = "BROKER_URLS",
          value = var.broker_urls
        },
        {
          name  = "CLIENT_URL",
          value = var.client_url
        },
        {
          name  = "MESSAGES_DATABASE_URL",
          value = var.messages_database_url
        },
        {
          name  = "JWT_SECRET",
          value = var.jwt_secret
        },
        {
          name  = "KAFKA_PASS",
          value = var.kafka_pass
        },
        {
          name  = "KAFKA_USER",
          value = var.kafka_user
        },
        {
          name  = "NODE_ENV",
          value = var.node_env
        },
        {
          name  = "PORT",
          value = var.port
        },
        {
          name  = "REDIS_URL",
          value = var.redis_url
        },
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = "/chatterbox/ecs/messages-service",
          awslogs-region        = "us-west-1",
          awslogs-create-group  = "true",
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
