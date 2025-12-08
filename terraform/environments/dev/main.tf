# ================================
# Development Environment Configuration
# ================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Use the root module
module "infrastructure" {
  source = "../../"

  aws_region   = var.aws_region
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr

  db_username = var.db_username
  db_password = var.db_password

  jwt_secret           = var.jwt_secret
  whatsapp_api_url     = var.whatsapp_api_url
  whatsapp_api_key     = var.whatsapp_api_key
  whatsapp_instance_id = var.whatsapp_instance_id
  ollama_api_url       = var.ollama_api_url

  backend_cpu     = var.backend_cpu
  backend_memory  = var.backend_memory
  frontend_cpu    = var.frontend_cpu
  frontend_memory = var.frontend_memory
  desired_count   = var.desired_count
}

# Variables (same as root)
variable "aws_region" { type = string }
variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_cidr" { type = string }
variable "db_username" { type = string; sensitive = true }
variable "db_password" { type = string; sensitive = true }
variable "jwt_secret" { type = string; sensitive = true }
variable "whatsapp_api_url" { type = string }
variable "whatsapp_api_key" { type = string; sensitive = true }
variable "whatsapp_instance_id" { type = string }
variable "ollama_api_url" { type = string }
variable "backend_cpu" { type = number }
variable "backend_memory" { type = number }
variable "frontend_cpu" { type = number }
variable "frontend_memory" { type = number }
variable "desired_count" { type = number }

# Outputs
output "alb_dns_name" {
  value = module.infrastructure.alb_dns_name
}

output "backend_url" {
  value = module.infrastructure.backend_url
}

output "frontend_url" {
  value = module.infrastructure.frontend_url
}
