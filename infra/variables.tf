variable "accounts_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "base_url" {
  type     = string
  nullable = false
}

variable "broker_urls" {
  type     = string
  nullable = false
}

variable "client_url" {
  type     = string
  nullable = false
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

variable "ip" {
  type      = string
  nullable  = false
  sensitive = true
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

variable "messages_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "node_env" {
  type     = string
  nullable = false
}

variable "parties_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "redis_url" {
  type      = string
  nullable  = false
  sensitive = true
}
