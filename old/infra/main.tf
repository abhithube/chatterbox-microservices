terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "chatterbox-backend"
    key    = "terraform.tfstate"
    region = "us-west-1"
  }
}

provider "aws" {
  region = "us-west-1"
}

module "accounts" {
  source                = "./modules/accounts"
  accounts_database_url = var.accounts_database_url
  broker_urls           = var.broker_urls
  client_url            = var.client_url
  ecs_cluster_id        = aws_ecs_cluster.main.id
  github_client_id      = var.github_client_id
  github_client_secret  = var.github_client_secret
  google_client_id      = var.google_client_id
  google_client_secret  = var.google_client_secret
  base_url              = var.base_url
  jwt_secret            = var.jwt_secret
  kafka_pass            = var.kafka_pass
  kafka_user            = var.kafka_user
  lb_listener_arn       = aws_lb_listener.main.arn
  node_env              = var.node_env
  vpc_id                = data.aws_vpc.main.id
}

module "messages" {
  source                = "./modules/messages"
  broker_urls           = var.broker_urls
  client_url            = var.client_url
  ecs_cluster_id        = aws_ecs_cluster.main.id
  jwt_secret            = var.jwt_secret
  kafka_pass            = var.kafka_pass
  kafka_user            = var.kafka_user
  lb_listener_arn       = aws_lb_listener.main.arn
  node_env              = var.node_env
  messages_database_url = var.messages_database_url
  redis_url             = var.redis_url
  vpc_id                = data.aws_vpc.main.id
}

module "parties" {
  source               = "./modules/parties"
  broker_urls          = var.broker_urls
  client_url           = var.client_url
  ecs_cluster_id       = aws_ecs_cluster.main.id
  jwt_secret           = var.jwt_secret
  kafka_pass           = var.kafka_pass
  kafka_user           = var.kafka_user
  lb_listener_arn      = aws_lb_listener.main.arn
  node_env             = var.node_env
  parties_database_url = var.parties_database_url
  vpc_id               = data.aws_vpc.main.id
}

# ACM (Certificate Manager)

resource "aws_acm_certificate" "main" {
  domain_name       = "api.chatterbox.abhithube.com"
  validation_method = "DNS"
}

# Auto Scaling

resource "aws_autoscaling_group" "main" {
  name               = "ChatterboxAutoScalingGroup"
  max_size           = 2
  min_size           = 1
  availability_zones = [for subnet in data.aws_subnet.main : subnet.availability_zone]

  launch_template {
    id = aws_launch_template.main.id
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_schedule" "morning" {
  scheduled_action_name  = "ChatterboxAutoScalingMorningSchedule"
  max_size               = 2
  min_size               = 1
  desired_capacity       = 1
  recurrence             = "0 16 * * *"
  autoscaling_group_name = aws_autoscaling_group.main.name
}

resource "aws_autoscaling_schedule" "evening" {
  scheduled_action_name  = "ChatterboxAutoScalingEveningSchedule"
  max_size               = 0
  min_size               = 0
  desired_capacity       = 0
  recurrence             = "0 4 * * *"
  autoscaling_group_name = aws_autoscaling_group.main.name
}

# EC2 (Elastic Compute Cloud)

data "aws_ami" "main" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-*-amazon-ecs-optimized"]
  }
}

resource "aws_launch_template" "main" {
  name                   = "ChatterboxLaunchTemplate"
  image_id               = data.aws_ami.main.image_id
  instance_type          = "t2.micro"
  key_name               = "ChatterboxEC2KeyPair"
  update_default_version = true
  security_group_names   = [aws_security_group.internal.name]
  user_data              = base64encode("#!/bin/bash\necho 'ECS_CLUSTER=${aws_ecs_cluster.main.name}' >> /etc/ecs/ecs.config")

  iam_instance_profile {
    name = aws_iam_instance_profile.main.name
  }
}

# ECS (Elastic Container)

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
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.main.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.main.name
    weight            = 100
    base              = 1
  }
}

# ELB (Elastic Load Balancing)

resource "aws_lb" "main" {
  name               = "ChatterboxLB"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.internet.id]
  subnets            = [for subnet in data.aws_subnet.main : subnet.id]
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      status_code  = "404"
    }
  }
}

# IAM (Identity & Access Management)

resource "aws_iam_instance_profile" "main" {
  name = "ChatterboxECSInstanceProfile"
  role = aws_iam_role.main.name
}

resource "aws_iam_role" "main" {
  name               = "ChatterboxECSInstanceRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_instance_role.json
}

resource "aws_iam_policy" "main" {
  name   = "ChatterboxECSLogsPolicy"
  policy = data.aws_iam_policy_document.ecs_logs.json
}

resource "aws_iam_role_policy_attachment" "ec2_container_service" {
  role       = aws_iam_role.main.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_logs" {
  role       = aws_iam_role.main.name
  policy_arn = aws_iam_policy.main.arn
}

data "aws_iam_policy_document" "ecs_instance_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ecs_logs" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

# VPC (Virtual Private Cloud)

data "aws_vpc" "main" {
  default = true
}

data "aws_subnets" "main" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
}

data "aws_subnet" "main" {
  for_each = toset(data.aws_subnets.main.ids)
  id       = each.value
}

resource "aws_security_group" "internet" {
  name   = "ChatterboxInternetSecurityGroup"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "internal" {
  name   = "ChatterboxInternalSecurityGroup"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ip]
  }

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.internet.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
