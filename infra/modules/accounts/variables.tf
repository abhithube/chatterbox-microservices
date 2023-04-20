variable "accounts_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "broker_urls" {
  type     = string
  nullable = false
}

variable "client_url" {
  type     = string
  nullable = false
}

variable "ecs_cluster_id" {
  type = string
}

variable "github_client_id" {
  type     = string
  nullable = false
}

variable "github_client_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "google_client_id" {
  type     = string
  nullable = false
}

variable "google_client_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "google_oauth_callback_url" {
  type     = string
  nullable = false
}

variable "jwt_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "kafka_pass" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "kafka_user" {
  type     = string
  nullable = false
}

variable "lb_listener_arn" {
  type = string
}

variable "node_env" {
  type     = string
  nullable = false
}

variable "port" {
  type     = string
  nullable = false
}

variable "vpc_id" {
  type = string
}
