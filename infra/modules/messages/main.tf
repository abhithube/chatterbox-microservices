# ECR (Elastic Container Registry)

resource "aws_ecr_repository" "main" {
  name = "chatterbox-messages"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# ECS (Elastic Container)

resource "aws_ecs_task_definition" "main" {
  family = "ChatterboxMessagesECSTaskDefinition"
  cpu    = 128
  memory = 64

  container_definitions = jsonencode([
    {
      name  = "messages"
      image = aws_ecr_repository.main.repository_url
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
          name  = "MESSAGES_DATABASE_URL",
          value = var.messages_database_url
        },
        {
          name  = "MESSAGES_PORT",
          value = "80"
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

resource "aws_ecs_service" "main" {
  name                 = "ChatterboxMessagesECSService"
  cluster              = var.ecs_cluster_id
  desired_count        = 1
  launch_type          = "EC2"
  task_definition      = aws_ecs_task_definition.main.arn
  force_new_deployment = true

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "messages"
    container_port   = 80
  }
}

# ELB (Elastic Load Balancing)

resource "aws_lb_target_group" "main" {
  name     = "ChatterboxMessagesLBTargetGroup"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    matcher = "200"
    path    = "/messages/health"
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
      values = ["/messages/*"]
    }
  }
}
