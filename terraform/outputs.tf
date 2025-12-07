# ================================
# Terraform Outputs
# ================================

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${module.alb.alb_dns_name}/api"
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${module.alb.alb_dns_name}"
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.frontend_repository_url
}

output "mongodb_endpoint" {
  description = "MongoDB (DocumentDB) endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_backend_service_name" {
  description = "ECS backend service name"
  value       = module.ecs.backend_service_name
}

output "ecs_frontend_service_name" {
  description = "ECS frontend service name"
  value       = module.ecs.frontend_service_name
}
