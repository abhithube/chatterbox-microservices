# General

variable "ip" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "ecs_cluster_name" {
  type    = string
  default = "ChatterboxECSCluster"
}

# Common Config

variable "common_config" {
  type = object({
    broker_urls = string
    client_url  = string
    kafka_user  = string
    node_env    = string
    port        = string
  })

  nullable = false
}


variable "common_secrets" {
  type = object({
    jwt_secret = string
    kafka_pass = string
  })

  nullable  = false
  sensitive = true
}

# Accounts Config

variable "accounts_config" {
  type = object({
    github_client_id          = string
    google_client_id          = string
    google_oauth_callback_url = string
  })

  nullable = false
}

variable "accounts_secrets" {
  type = object({
    database_url         = string
    google_client_secret = string
    github_client_secret = string
  })

  nullable  = false
  sensitive = true
}

# Messages Config

variable "messages_secrets" {
  type = object({
    database_url = string
    redis_url    = string
  })

  nullable  = false
  sensitive = true
}
