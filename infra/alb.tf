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
  certificate_arn   = aws_acm_certificate_validation.backend.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      status_code  = "400"
    }
  }
}

### Accounts

resource "aws_lb_target_group" "accounts" {
  name     = "ChatterboxAccountsLBTargetGroup"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.main.id

  health_check {
    matcher = "200"
    path    = "/accounts-service/health"
  }
}

resource "aws_lb_listener_rule" "accounts" {
  listener_arn = aws_lb_listener.main.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.accounts.arn
  }

  condition {
    path_pattern {
      values = ["/accounts-service/*"]
    }
  }
}

resource "aws_lb_target_group" "messages" {
  name     = "ChatterboxMessagesLBTargetGroup"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.main.id

  health_check {
    matcher = "200"
    path    = "/messages-service/health"
  }
}

### Messages

resource "aws_lb_listener_rule" "messages" {
  listener_arn = aws_lb_listener.main.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.messages.arn
  }

  condition {
    path_pattern {
      values = ["/messages-service/*"]
    }
  }
}
