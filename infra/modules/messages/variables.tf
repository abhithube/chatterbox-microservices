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

variable "messages_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "node_env" {
  type     = string
  nullable = false
}

variable "redis_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "vpc_id" {
  type = string
}
