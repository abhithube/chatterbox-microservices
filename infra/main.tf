terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.71"
    }
  }
}

provider "aws" {
  region = "us-west-1"
}
