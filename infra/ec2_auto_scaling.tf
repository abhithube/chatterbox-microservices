resource "aws_launch_template" "main" {
  name                   = "ChatterboxLaunchTemplate"
  image_id               = "ami-0a2c844e6bc854d96"
  instance_type          = "t2.micro"
  key_name               = "ChatterboxEC2KeyPair"
  update_default_version = true
  security_group_names   = [aws_security_group.internal.name]

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs.name
  }

  user_data = base64encode("#!/bin/bash\necho 'ECS_CLUSTER=${var.ecs_cluster_name}' >> /etc/ecs/ecs.config")
}

resource "aws_autoscaling_group" "main" {
  name               = "ChatterboxAutoScalingGroup"
  max_size           = 2
  min_size           = 1
  availability_zones = ["us-west-1a"]

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
