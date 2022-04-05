### Accounts

resource "aws_ecr_repository" "accounts" {
  name = "chatterbox-accounts"

  image_scanning_configuration {
    scan_on_push = true
  }
}

### Messages

resource "aws_ecr_repository" "messages" {
  name = "chatterbox-messages"

  image_scanning_configuration {
    scan_on_push = true
  }
}