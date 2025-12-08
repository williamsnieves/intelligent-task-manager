#!/bin/bash

# ================================
# AWS Infrastructure Setup Script
# Initializes and applies Terraform configuration
# ================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
PROJECT_NAME="intelligent-task-manager"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  AWS Infrastructure Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first:${NC}"
    echo -e "${YELLOW}   brew install terraform${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first:${NC}"
    echo -e "${YELLOW}   brew install awscli${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run:${NC}"
    echo -e "${YELLOW}   aws configure${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}\n"

# Navigate to environment directory
cd terraform/environments/${ENVIRONMENT}

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}❌ terraform.tfvars not found${NC}"
    echo -e "${YELLOW}📝 Creating from example...${NC}"
    
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        echo -e "${YELLOW}⚠️  Please edit terraform.tfvars with your values:${NC}"
        echo -e "${YELLOW}   - db_username${NC}"
        echo -e "${YELLOW}   - db_password${NC}"
        echo -e "${YELLOW}   - jwt_secret${NC}"
        echo -e "${YELLOW}   - whatsapp_api_url (optional)${NC}"
        echo -e "${YELLOW}   - whatsapp_api_key (optional)${NC}"
        echo -e "${YELLOW}   - ollama_api_url (optional)${NC}"
        exit 1
    else
        echo -e "${RED}❌ terraform.tfvars.example not found${NC}"
        exit 1
    fi
fi

# Initialize Terraform
echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
terraform init

# Validate configuration
echo -e "${YELLOW}✅ Validating Terraform configuration...${NC}"
terraform validate

# Format Terraform files
echo -e "${YELLOW}📝 Formatting Terraform files...${NC}"
terraform fmt -recursive

# Plan infrastructure
echo -e "${YELLOW}📋 Planning infrastructure changes...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  This will create AWS resources that may incur costs${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Estimated monthly cost: ~\$120-140${NC}"
echo -e "${YELLOW}With optimizations: ~\$15-30${NC}\n"

read -p "Do you want to proceed? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

# Apply infrastructure
echo -e "${YELLOW}🚀 Applying infrastructure changes...${NC}"
terraform apply tfplan

# Get outputs
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Infrastructure created successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}📊 Infrastructure Outputs:${NC}"
terraform output

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}1. Build and push Docker images:${NC}"
echo -e "${GREEN}   ./scripts/deploy.sh${NC}\n"
echo -e "${YELLOW}2. Configure GitHub secrets for CI/CD:${NC}"
echo -e "${GREEN}   - AWS_ACCESS_KEY_ID${NC}"
echo -e "${GREEN}   - AWS_SECRET_ACCESS_KEY${NC}"
echo -e "${GREEN}   - VITE_API_URL (use the backend_url output)${NC}\n"
echo -e "${YELLOW}3. Access your application:${NC}"
ALB_DNS=$(terraform output -raw alb_dns_name)
echo -e "${GREEN}   http://${ALB_DNS}${NC}\n"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
