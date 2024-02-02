# ECR (Elastic Container Registry)

resource "aws_ecr_repository" "main" {
  name = "chatterbox-accounts"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# ECS (Elastic Container)

resource "aws_ecs_task_definition" "main" {
  family = "ChatterboxAccountsECSTaskDefinition"
  cpu    = 128
  memory = 64

  container_definitions = jsonencode([
    {
      name  = "accounts"
      image = aws_ecr_repository.main.repository_url
      portMappings = [
        {
          containerPort = 80
        }
      ]
      essential = true
      environment = [
        {
          name  = "ACCOUNTS_DATABASE_URL",
          value = var.accounts_database_url
        },
        {
          name  = "ACCOUNTS_PORT",
          value = "80"
        },
        {
          name  = "BASE_URL",
          value = var.base_url
        },
        {
          name  = "BROKER_URLS",
          value = var.broker_urls
        },
        {
          name  = "CLIENT_URL",
          value = var.client_url
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

resource "aws_ecs_service" "main" {
  name                 = "ChatterboxAccountsECSService"
  cluster              = var.ecs_cluster_id
  desired_count        = 1
  launch_type          = "EC2"
  task_definition      = aws_ecs_task_definition.main.arn
  force_new_deployment = true

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "accounts"
    container_port   = 80
  }
}

# ELB (Elastic Load Balancing)

resource "aws_lb_target_group" "main" {
  name     = "ChatterboxAccountsLBTargetGroup"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    matcher = "200"
    path    = "/auth/health"
  }
}

resource "aws_lb_listener_rule" "main" {
  listener_arn = var.lb_listener_arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  condition {
    path_pattern {
      values = ["/auth/*", "/users/*"]
    }
  }
}
