variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "ecs_security_group" {
  description = "ECS security group ID"
  type        = string
}

variable "backend_ecr_url" {
  description = "Backend ECR repository URL"
  type        = string
}

variable "frontend_ecr_url" {
  description = "Frontend ECR repository URL"
  type        = string
}

variable "alb_target_group_arn" {
  description = "ALB target group ARN for backend"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "ALB target group ARN for frontend"
  type        = string
}

variable "mongodb_connection_string" {
  description = "MongoDB connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "whatsapp_api_url" {
  description = "WhatsApp API URL"
  type        = string
}

variable "whatsapp_api_key" {
  description = "WhatsApp API key"
  type        = string
  sensitive   = true
}

variable "whatsapp_instance_id" {
  description = "WhatsApp instance ID"
  type        = string
}

variable "ollama_api_url" {
  description = "Ollama API URL"
  type        = string
}

variable "backend_cpu" {
  description = "Backend task CPU"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend task memory"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Frontend task CPU"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend task memory"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}
