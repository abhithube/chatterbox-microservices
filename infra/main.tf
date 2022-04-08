terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "chatterbox-tf-backend"
    key    = "terraform.tfstate"
    region = "us-west-1"
  }
}

provider "aws" {
  region = "us-west-1"
}
