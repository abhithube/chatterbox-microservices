variable "broker_urls" {
  type     = string
  nullable = false
}

variable "client_url" {
  type     = string
  nullable = false
}

variable "kafka_user" {
  type     = string
  nullable = false
}


variable "node_env" {
  type     = string
  nullable = false
}

variable "port" {
  type     = string
  nullable = false
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
