# ================================
# Main Terraform Configuration
# Intelligent Task Manager - AWS Infrastructure
# ================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "intelligent-task-manager/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ================================
# VPC Module
# ================================
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

# ================================
# Security Groups Module
# ================================
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# ================================
# ECR Module
# ================================
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# ================================
# Application Load Balancer Module
# ================================
module "alb" {
  source = "./modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  alb_security_group = module.security.alb_security_group_id
}

# ================================
# RDS Module (DocumentDB for MongoDB compatibility)
# ================================
module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  db_security_group     = module.security.db_security_group_id
  db_username           = var.db_username
  db_password           = var.db_password
}

# ================================
# ECS Module
# ================================
module "ecs" {
  source = "./modules/ecs"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  ecs_security_group      = module.security.ecs_security_group_id
  backend_ecr_url         = module.ecr.backend_repository_url
  frontend_ecr_url        = module.ecr.frontend_repository_url
  alb_target_group_arn    = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  
  # Environment variables
  mongodb_connection_string = module.rds.connection_string
  jwt_secret                = var.jwt_secret
  whatsapp_api_url          = var.whatsapp_api_url
  whatsapp_api_key          = var.whatsapp_api_key
  whatsapp_instance_id      = var.whatsapp_instance_id
  ollama_api_url            = var.ollama_api_url
}
