# ================================
# Terraform Variables
# ================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "intelligent-task-manager"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ================================
# Database Variables
# ================================

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ================================
# Application Variables
# ================================

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "whatsapp_api_url" {
  description = "WhatsApp Evolution API URL"
  type        = string
  default     = ""
}

variable "whatsapp_api_key" {
  description = "WhatsApp Evolution API Key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "whatsapp_instance_id" {
  description = "WhatsApp instance ID"
  type        = string
  default     = "task-manager"
}

variable "ollama_api_url" {
  description = "Ollama API URL"
  type        = string
  default     = ""
}

# ================================
# ECS Task Configuration
# ================================

variable "backend_cpu" {
  description = "CPU units for backend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory for backend task in MB"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}
