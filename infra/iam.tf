resource "aws_iam_role" "ecs" {
  name = "ChatterboxECSInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "ecs_logs_policy" {
  name = "ChatterboxECSLogsPolicy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:logs:*:*:*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_container_service" {
  role       = aws_iam_role.ecs.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_logs" {
  role       = aws_iam_role.ecs.name
  policy_arn = aws_iam_policy.ecs_logs_policy.arn
}

resource "aws_iam_instance_profile" "ecs" {
  name = "ChatterboxECSInstanceProfile"
  role = aws_iam_role.ecs.name
}
