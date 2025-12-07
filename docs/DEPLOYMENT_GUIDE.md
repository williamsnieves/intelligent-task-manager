# 🚀 Deployment Guide - Intelligent Task Manager

Este documento proporciona instrucciones completas para desplegar la aplicación en AWS usando Terraform e Infrastructure as Code (IaC).

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Arquitectura de Deployment](#arquitectura-de-deployment)
- [Configuración Inicial](#configuración-inicial)
- [Deployment con Terraform](#deployment-con-terraform)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Costos y Optimización](#costos-y-optimización)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### 1. Herramientas Necesarias

```bash
# Terraform (>= 1.0)
brew install terraform

# AWS CLI (>= 2.0)
brew install awscli

# Docker
brew install docker

# pnpm (para builds locales)
npm install -g pnpm
```

### 2. Cuenta de AWS

- Cuenta de AWS activa
- Usuario IAM con permisos para:
  - ECS (Elastic Container Service)
  - ECR (Elastic Container Registry)
  - VPC, Subnets, Security Groups
  - DocumentDB o acceso a MongoDB Atlas
  - Application Load Balancer
  - CloudWatch Logs
  - IAM Roles y Policies

### 3. Credenciales de AWS

```bash
# Configurar AWS CLI
aws configure

# Verificar configuración
aws sts get-caller-identity
```

---

## 🏗️ Arquitectura de Deployment

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Application Load    │
              │     Balancer         │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐           ┌─────────────────┐
│  Frontend       │           │  Backend        │
│  (ECS Fargate)  │           │  (ECS Fargate)  │
│  - nginx        │           │  - NestJS       │
│  - React SPA    │           │  - Node 18      │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   DocumentDB     │
                            │   (MongoDB)      │
                            └──────────────────┘
```

### Servicios AWS Utilizados

| Servicio | Propósito | Costo Estimado |
|----------|-----------|----------------|
| **ECS Fargate** | Contenedores sin servidor | ~$15-30/mes (0.25 vCPU, 512MB) |
| **DocumentDB** | Base de datos MongoDB | ~$50/mes (db.t3.medium) |
| **ALB** | Load Balancer | ~$16/mes + data transfer |
| **ECR** | Registry de imágenes Docker | ~$1/mes (< 500MB) |
| **VPC/Subnets** | Networking | Gratis |
| **CloudWatch** | Logs y monitoreo | ~$5/mes |
| **NAT Gateway** | Salida a internet privada | ~$32/mes |

**Total estimado**: ~$120-140/mes

### 💡 Alternativa de Costo Cero

Para minimizar costos a **$0/mes**:

1. **MongoDB Atlas Free Tier (M0)**:
   - 512MB storage
   - Shared CPU
   - Gratis permanentemente
   - [Crear cuenta aquí](https://www.mongodb.com/cloud/atlas/register)

2. **ECS Fargate Free Tier**:
   - Primeros 12 meses: 50 GB-month de almacenamiento efímero
   - Después: ~$15/mes por 2 tareas (frontend + backend)

3. **Eliminar NAT Gateway**:
   - Usar subnets públicas para ECS (menos seguro pero gratis)
   - Ahorro: ~$32/mes

**Con estas optimizaciones**: ~$15-30/mes (después del free tier)

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd intelligent-task-manager
```

### 2. Configurar MongoDB Atlas (Recomendado para Costo Cero)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crear un cluster gratuito (M0)
3. Configurar acceso de red: permitir acceso desde cualquier IP (0.0.0.0/0)
4. Crear usuario de base de datos
5. Obtener connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority
   ```

### 3. Configurar Variables de Terraform

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

Editar `terraform.tfvars`:

```hcl
aws_region   = "us-east-1"
project_name = "intelligent-task-manager"
environment  = "dev"
vpc_cidr     = "10.0.0.0/16"

# Database (si usas DocumentDB en AWS)
db_username = "admin"
db_password = "YourSecurePassword123!"

# Application
jwt_secret = "your-super-secret-jwt-key-change-this"

# WhatsApp (opcional)
whatsapp_api_url     = "https://your-evolution-api.com"
whatsapp_api_key     = "your-api-key"
whatsapp_instance_id = "task-manager"

# Ollama (opcional)
ollama_api_url = "https://your-ollama-instance.com"

# ECS Configuration (Free tier eligible)
backend_cpu      = 256  # 0.25 vCPU
backend_memory   = 512  # 512 MB
frontend_cpu     = 256  # 0.25 vCPU
frontend_memory  = 512  # 512 MB
desired_count    = 1
```

### 4. Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings → Secrets and variables → Actions** y agrega:

| Secret | Descripción |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key |
| `VITE_API_URL` | URL del backend (se obtiene después del primer deploy) |

---

## 🚀 Deployment con Terraform

### 1. Inicializar Terraform

```bash
cd terraform/environments/dev
terraform init
```

### 2. Validar Configuración

```bash
terraform validate
terraform plan
```

Revisa el plan de ejecución. Terraform creará aproximadamente **40-50 recursos**.

### 3. Aplicar Infraestructura

```bash
terraform apply
```

Escribe `yes` cuando se te solicite.

⏱️ **Tiempo estimado**: 10-15 minutos

### 4. Obtener Outputs

```bash
terraform output

# Outputs esperados:
# alb_dns_name = "intelligent-task-manager-dev-alb-1234567890.us-east-1.elb.amazonaws.com"
# backend_url = "http://intelligent-task-manager-dev-alb-1234567890.us-east-1.elb.amazonaws.com/api"
# frontend_url = "http://intelligent-task-manager-dev-alb-1234567890.us-east-1.elb.amazonaws.com"
# ecr_backend_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/intelligent-task-manager-dev-backend"
# ecr_frontend_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/intelligent-task-manager-dev-frontend"
```

### 5. Build y Push de Imágenes Docker

#### Backend

```bash
cd ../../backend

# Login a ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_BACKEND_URL>

# Build
docker build -t intelligent-task-manager-dev-backend .

# Tag
docker tag intelligent-task-manager-dev-backend:latest <ECR_BACKEND_URL>:latest

# Push
docker push <ECR_BACKEND_URL>:latest
```

#### Frontend

```bash
cd ../frontend

# Login a ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_FRONTEND_URL>

# Build con API URL
docker build \
  --build-arg VITE_API_URL=http://<ALB_DNS_NAME>/api \
  -t intelligent-task-manager-dev-frontend .

# Tag
docker tag intelligent-task-manager-dev-frontend:latest <ECR_FRONTEND_URL>:latest

# Push
docker push <ECR_FRONTEND_URL>:latest
```

### 6. Forzar Deployment en ECS

```bash
# Backend
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-backend-service \
  --force-new-deployment

# Frontend
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-frontend-service \
  --force-new-deployment
```

### 7. Verificar Deployment

```bash
# Ver estado de servicios
aws ecs describe-services \
  --cluster intelligent-task-manager-dev-cluster \
  --services intelligent-task-manager-dev-backend-service intelligent-task-manager-dev-frontend-service

# Ver logs de backend
aws logs tail /ecs/intelligent-task-manager-dev-backend --follow

# Ver logs de frontend
aws logs tail /ecs/intelligent-task-manager-dev-frontend --follow
```

### 8. Acceder a la Aplicación

```bash
# Obtener URL del ALB
ALB_URL=$(terraform output -raw alb_dns_name)

# Abrir en navegador
open "http://$ALB_URL"
```

---

## 🔄 CI/CD con GitHub Actions

### Workflow Automático

El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente en cada push a `main`:

1. **Build**: Construye imágenes Docker de backend y frontend
2. **Push**: Sube imágenes a ECR con tag del commit SHA
3. **Deploy**: Actualiza servicios ECS con nuevas imágenes
4. **Wait**: Espera a que los servicios estén estables

### Trigger Manual

```bash
# Desde GitHub UI: Actions → Deploy to AWS ECS → Run workflow
```

### Monitorear Deployment

```bash
# Ver logs del workflow en GitHub Actions
# O desde CLI:
gh run list --workflow=deploy.yml
gh run view <run-id> --log
```

---

## 📊 Monitoreo y Logs

### CloudWatch Logs

```bash
# Backend logs
aws logs tail /ecs/intelligent-task-manager-dev-backend --follow

# Frontend logs
aws logs tail /ecs/intelligent-task-manager-dev-frontend --follow

# Filtrar errores
aws logs filter-log-events \
  --log-group-name /ecs/intelligent-task-manager-dev-backend \
  --filter-pattern "ERROR"
```

### Métricas de ECS

```bash
# CPU y memoria del backend
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=intelligent-task-manager-dev-backend-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Health Checks

```bash
# Backend health
curl http://<ALB_DNS_NAME>/health

# Frontend health
curl http://<ALB_DNS_NAME>/health
```

---

## 💰 Costos y Optimización

### Reducir Costos

#### 1. Usar MongoDB Atlas Free Tier

Comentar el módulo RDS en `terraform/main.tf`:

```hcl
# module "rds" {
#   source = "./modules/rds"
#   ...
# }
```

Y usar MongoDB Atlas connection string en variables de entorno.

#### 2. Eliminar NAT Gateway

En `terraform/modules/vpc/main.tf`, comentar NAT Gateway y usar subnets públicas para ECS:

```hcl
# resource "aws_nat_gateway" "main" { ... }
# resource "aws_eip" "nat" { ... }
```

En `terraform/modules/ecs/main.tf`:

```hcl
network_configuration {
  subnets          = var.public_subnet_ids  # Cambiar de private a public
  security_groups  = [var.ecs_security_group]
  assign_public_ip = true  # Cambiar a true
}
```

⚠️ **Nota**: Esto expone las tareas ECS directamente a internet (menos seguro).

#### 3. Escalar a Cero en Horarios No Productivos

```bash
# Escalar a 0 (detener)
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-backend-service \
  --desired-count 0

# Escalar a 1 (iniciar)
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-backend-service \
  --desired-count 1
```

### Monitorear Costos

```bash
# Ver costos estimados
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

---

## 🔧 Troubleshooting

### Problema: Tasks no inician

**Síntomas**: ECS tasks en estado `PENDING` o `STOPPED`

**Solución**:

```bash
# Ver eventos del servicio
aws ecs describe-services \
  --cluster intelligent-task-manager-dev-cluster \
  --services intelligent-task-manager-dev-backend-service \
  --query 'services[0].events[0:5]'

# Ver logs de la tarea
aws ecs describe-tasks \
  --cluster intelligent-task-manager-dev-cluster \
  --tasks <task-arn> \
  --query 'tasks[0].containers[0].reason'
```

**Causas comunes**:
- Imagen Docker no encontrada en ECR
- Credenciales de ECR expiradas
- Recursos insuficientes (CPU/memoria)
- Variables de entorno incorrectas

### Problema: ALB devuelve 502/503

**Síntomas**: Load balancer devuelve errores 5xx

**Solución**:

```bash
# Verificar health checks
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# Ver logs de backend
aws logs tail /ecs/intelligent-task-manager-dev-backend --follow
```

**Causas comunes**:
- Backend no responde en puerto 3001
- Health check endpoint `/health` no implementado
- Security group bloqueando tráfico ALB → ECS

### Problema: No puedo conectar a MongoDB

**Síntomas**: Backend logs muestran errores de conexión a DB

**Solución**:

```bash
# Verificar security group de DocumentDB
aws ec2 describe-security-groups \
  --group-ids <db-security-group-id>

# Verificar que ECS security group puede acceder
# Puerto 27017 debe estar abierto desde ECS SG
```

### Problema: Deployment lento

**Síntomas**: GitHub Actions tarda > 20 minutos

**Solución**:

```bash
# Usar Docker layer caching
# Ya implementado en .github/workflows/deploy.yml con:
# --cache-from $ECR_REGISTRY/$ECR_BACKEND_REPOSITORY:latest

# Reducir health check grace period en task definition
```

---

## 🗑️ Destruir Infraestructura

⚠️ **CUIDADO**: Esto eliminará todos los recursos y datos.

```bash
cd terraform/environments/dev

# Ver qué se va a destruir
terraform plan -destroy

# Destruir
terraform destroy
```

Escribe `yes` cuando se te solicite.

---

## 📚 Referencias

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 🤝 Soporte

Para problemas o preguntas:
1. Revisar [Troubleshooting](#troubleshooting)
2. Consultar logs de CloudWatch
3. Abrir issue en GitHub

---

**Última actualización**: Diciembre 2025  
**Versión**: 1.0
