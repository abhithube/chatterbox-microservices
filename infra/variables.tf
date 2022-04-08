# General

variable "ip" {
  type      = string
  nullable  = false
  sensitive = true
}

# Common Config

variable "broker_urls" {
  type      = string
  nullable  = false
}

variable "client_url" {
  type      = string
  nullable  = false
}

variable "kafka_user" {
  type      = string
  nullable  = false
}

variable "node_env" {
  type      = string
  nullable  = false
}

variable "port" {
  type      = string
  nullable  = false
}

# Common Secrets

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

# Accounts Config

variable "github_client_id" {
  type      = string
  nullable  = false
}

variable "google_client_id" {
  type      = string
  nullable  = false
}

variable "google_oauth_callback_url" {
  type      = string
  nullable  = false
}

# Accounts Secrets

variable "accounts_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "github_client_secret" {
  type      = string
  nullable  = false
  sensitive = true
}

# Messages Secrets

variable "messages_database_url" {
  type      = string
  nullable  = false
  sensitive = true
}

variable "redis_url" {
  type      = string
  nullable  = false
  sensitive = true
}