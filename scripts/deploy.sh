#!/bin/bash

# ================================
# Deployment Script
# Builds and pushes Docker images to AWS ECR
# ================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-dev}
PROJECT_NAME="intelligent-task-manager"

echo -e "${GREEN}🚀 Starting deployment process...${NC}\n"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Get ECR repository URLs from Terraform outputs
echo -e "${YELLOW}📦 Getting ECR repository URLs...${NC}"
cd terraform/environments/${ENVIRONMENT}

if [ ! -f "terraform.tfstate" ]; then
    echo -e "${RED}❌ Terraform state not found. Please run 'terraform apply' first.${NC}"
    exit 1
fi

BACKEND_ECR_URL=$(terraform output -raw ecr_backend_repository_url)
FRONTEND_ECR_URL=$(terraform output -raw ecr_frontend_repository_url)
ALB_DNS=$(terraform output -raw alb_dns_name)

echo -e "${GREEN}✅ Backend ECR: ${BACKEND_ECR_URL}${NC}"
echo -e "${GREEN}✅ Frontend ECR: ${FRONTEND_ECR_URL}${NC}"
echo -e "${GREEN}✅ ALB DNS: ${ALB_DNS}${NC}\n"

cd ../../..

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${BACKEND_ECR_URL%/*}

# Build and push backend
echo -e "${YELLOW}🏗️  Building backend image...${NC}"
cd backend
docker build -t ${PROJECT_NAME}-${ENVIRONMENT}-backend .
docker tag ${PROJECT_NAME}-${ENVIRONMENT}-backend:latest ${BACKEND_ECR_URL}:latest
docker tag ${PROJECT_NAME}-${ENVIRONMENT}-backend:latest ${BACKEND_ECR_URL}:$(git rev-parse --short HEAD)

echo -e "${YELLOW}📤 Pushing backend image...${NC}"
docker push ${BACKEND_ECR_URL}:latest
docker push ${BACKEND_ECR_URL}:$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Backend image pushed${NC}\n"

# Build and push frontend
echo -e "${YELLOW}🏗️  Building frontend image...${NC}"
cd ../frontend
docker build \
    --build-arg VITE_API_URL=http://${ALB_DNS}/api \
    -t ${PROJECT_NAME}-${ENVIRONMENT}-frontend .
docker tag ${PROJECT_NAME}-${ENVIRONMENT}-frontend:latest ${FRONTEND_ECR_URL}:latest
docker tag ${PROJECT_NAME}-${ENVIRONMENT}-frontend:latest ${FRONTEND_ECR_URL}:$(git rev-parse --short HEAD)

echo -e "${YELLOW}📤 Pushing frontend image...${NC}"
docker push ${FRONTEND_ECR_URL}:latest
docker push ${FRONTEND_ECR_URL}:$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Frontend image pushed${NC}\n"

cd ..

# Update ECS services
echo -e "${YELLOW}🔄 Updating ECS services...${NC}"
aws ecs update-service \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --service ${PROJECT_NAME}-${ENVIRONMENT}-backend-service \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null

aws ecs update-service \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --service ${PROJECT_NAME}-${ENVIRONMENT}-frontend-service \
    --force-new-deployment \
    --region ${AWS_REGION} \
    > /dev/null

echo -e "${GREEN}✅ ECS services updated${NC}\n"

# Wait for services to stabilize
echo -e "${YELLOW}⏳ Waiting for services to stabilize (this may take a few minutes)...${NC}"
aws ecs wait services-stable \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --services ${PROJECT_NAME}-${ENVIRONMENT}-backend-service \
    --region ${AWS_REGION}

aws ecs wait services-stable \
    --cluster ${PROJECT_NAME}-${ENVIRONMENT}-cluster \
    --services ${PROJECT_NAME}-${ENVIRONMENT}-frontend-service \
    --region ${AWS_REGION}

echo -e "${GREEN}✅ Services are stable${NC}\n"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 Application URL: http://${ALB_DNS}${NC}"
echo -e "${GREEN}🔧 Backend API: http://${ALB_DNS}/api${NC}"
echo -e "${GREEN}📊 View logs: aws logs tail /ecs/${PROJECT_NAME}-${ENVIRONMENT}-backend --follow${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
