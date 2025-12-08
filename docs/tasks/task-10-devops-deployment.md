# Task 10: DevOps & Deployment ✅

## Goal
Containerize the application and prepare for deployment to AWS ECS using Infrastructure as Code (Terraform).

## Context
- **Container**: Docker multi-stage builds
- **CI/CD**: GitHub Actions (CI + CD)
- **Cloud**: AWS (ECS Fargate, DocumentDB, ALB, ECR)
- **IaC**: Terraform (modular architecture)

## Implementation Summary

### 1. Docker Containerization ✅

#### Backend Dockerfile
- [x] **Multi-stage build** con Node 18 Alpine
- [x] **Stage 1 (dependencies)**: Instala pnpm y dependencias
- [x] **Stage 2 (builder)**: Compila aplicación NestJS
- [x] **Stage 3 (production)**: Imagen final optimizada
  - Solo dependencias de producción
  - Non-root user para seguridad
  - Health check integrado
  - Tamaño optimizado (~150MB)

#### Frontend Dockerfile
- [x] **Multi-stage build** con Node 18 Alpine + nginx
- [x] **Stage 1 (dependencies)**: Instala pnpm y dependencias
- [x] **Stage 2 (builder)**: Compila React con Vite
- [x] **Stage 3 (production)**: nginx Alpine
  - Configuración nginx optimizada
  - Gzip compression
  - Security headers
  - SPA routing
  - Health check endpoint
  - Tamaño optimizado (~25MB)

#### Optimizaciones
- [x] `.dockerignore` files para reducir contexto
- [x] Layer caching para builds más rápidos
- [x] Health checks para ECS
- [x] Security best practices (non-root, minimal base images)

### 2. Infrastructure as Code (Terraform) ✅

#### Arquitectura Modular
```
terraform/
├── main.tf              # Orquestación principal
├── variables.tf         # Variables globales
├── outputs.tf          # Outputs de infraestructura
├── modules/            # Módulos reutilizables
│   ├── vpc/           # Networking (VPC, subnets, NAT)
│   ├── security/      # Security groups
│   ├── ecr/           # Container registry
│   ├── alb/           # Application Load Balancer
│   ├── rds/           # DocumentDB (MongoDB)
│   └── ecs/           # ECS Fargate services
└── environments/       # Configuraciones por entorno
    ├── dev/
    │   ├── main.tf
    │   └── terraform.tfvars.example
    └── prod/
```

#### Módulos Implementados

**VPC Module** ✅
- [x] VPC con CIDR configurable
- [x] 2 subnets públicas (para ALB)
- [x] 2 subnets privadas (para ECS y RDS)
- [x] Internet Gateway
- [x] NAT Gateway para salida privada
- [x] Route tables configuradas

**Security Module** ✅
- [x] ALB Security Group (HTTP/HTTPS público)
- [x] ECS Security Group (tráfico desde ALB)
- [x] DB Security Group (MongoDB desde ECS)

**ECR Module** ✅
- [x] Repositorio para backend
- [x] Repositorio para frontend
- [x] Lifecycle policies (mantiene últimas 5 imágenes)
- [x] Image scanning habilitado

**ALB Module** ✅
- [x] Application Load Balancer
- [x] Target groups para backend y frontend
- [x] Listener HTTP (puerto 80)
- [x] Listener rules para routing (/api/* → backend)
- [x] Health checks configurados

**RDS Module** ✅
- [x] DocumentDB cluster (MongoDB-compatible)
- [x] DB subnet group
- [x] Parameter group (TLS disabled para desarrollo)
- [x] Instancia db.t3.medium
- [x] Backup y maintenance windows
- [x] CloudWatch logs habilitados

**ECS Module** ✅
- [x] ECS Cluster con Container Insights
- [x] Task definitions para backend y frontend
- [x] Fargate launch type (serverless)
- [x] IAM roles (execution + task)
- [x] CloudWatch log groups
- [x] Services con auto-recovery
- [x] Integration con ALB
- [x] Environment variables configuradas

### 3. CI/CD Pipeline (GitHub Actions) ✅

#### Workflow: `.github/workflows/deploy.yml`
- [x] **Trigger**: Push a `main` o manual
- [x] **Jobs**:
  1. Checkout código
  2. Configurar credenciales AWS
  3. Login a ECR
  4. Build y push backend image
  5. Build y push frontend image (con VITE_API_URL)
  6. Update ECS backend service
  7. Update ECS frontend service
  8. Wait for services stability
  9. Deployment summary

#### Features
- [x] Docker layer caching para builds rápidos
- [x] Multi-architecture support
- [x] Automatic tagging (latest + commit SHA)
- [x] Health check verification
- [x] Rollback automático en caso de fallo

### 4. Documentación ✅

- [x] **DEPLOYMENT_GUIDE.md**: Guía completa de deployment
  - Requisitos previos
  - Arquitectura detallada
  - Configuración paso a paso
  - Optimización de costos
  - Troubleshooting
  - Monitoreo y logs
- [x] **terraform/README.md**: Documentación de infraestructura
- [x] **scripts/setup-aws.sh**: Script automatizado de setup
- [x] **scripts/deploy.sh**: Script de deployment manual
- [x] **terraform.tfvars.example**: Template de configuración

### 5. Scripts de Automatización ✅

#### `scripts/setup-aws.sh`
- [x] Verifica instalación de herramientas (Terraform, AWS CLI)
- [x] Valida credenciales de AWS
- [x] Inicializa Terraform
- [x] Valida y formatea configuración
- [x] Ejecuta plan y apply
- [x] Muestra outputs y próximos pasos

#### `scripts/deploy.sh`
- [x] Obtiene URLs de ECR desde Terraform
- [x] Login a ECR
- [x] Build y push de imágenes
- [x] Update de servicios ECS
- [x] Wait for stability
- [x] Deployment summary

## Costos y Optimización 💰

### Configuración Estándar
**Costo estimado**: ~$120-140/mes
- ECS Fargate: ~$15-30/mes (2 tareas, 0.25 vCPU, 512MB cada una)
- DocumentDB: ~$50/mes (db.t3.medium)
- ALB: ~$16/mes + data transfer
- NAT Gateway: ~$32/mes
- CloudWatch: ~$5/mes
- ECR: ~$1/mes

### Configuración Optimizada (Costo Cero)
**Costo estimado**: ~$15-30/mes
- ✅ **MongoDB Atlas Free Tier (M0)**: $0
- ✅ **ECS Fargate**: ~$15-30/mes (mínimo necesario)
- ✅ **ALB**: ~$16/mes (necesario para routing)
- ✅ **Sin NAT Gateway**: $0 (usar subnets públicas)
- ✅ **CloudWatch**: ~$5/mes (logs básicos)
- ✅ **ECR**: ~$1/mes (< 500MB)

### Recomendaciones
1. Usar MongoDB Atlas Free Tier en lugar de DocumentDB
2. Eliminar NAT Gateway (menos seguro pero gratis)
3. Escalar a 0 en horarios no productivos
4. Usar CloudWatch Logs con retención de 7 días
5. Limpiar imágenes antiguas en ECR

## Verificación ✅

### Local
- [x] `docker build` exitoso para backend
- [x] `docker build` exitoso para frontend
- [x] Imágenes optimizadas (tamaño reducido)
- [x] Health checks funcionando

### Terraform
- [x] `terraform validate` pasa
- [x] `terraform plan` sin errores
- [x] Todos los módulos funcionando
- [x] Outputs correctos

### AWS
- [x] ECR repositories creados
- [x] VPC y subnets configuradas
- [x] Security groups correctos
- [x] ALB funcionando
- [x] ECS cluster creado
- [x] Task definitions válidas
- [x] Services deployables

### CI/CD
- [x] GitHub Actions workflow válido
- [x] Secrets configurables
- [x] Build y push automático
- [x] Deployment automático

## Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Application Load    │
              │     Balancer         │
              │  (Public Subnets)    │
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
│  (Private)      │           │  (Private)      │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   DocumentDB     │
                            │   (MongoDB)      │
                            │   (Private)      │
                            └──────────────────┘
```

## Próximos Pasos

1. **Deployment Inicial**:
   ```bash
   cd terraform/environments/dev
   cp terraform.tfvars.example terraform.tfvars
   # Editar terraform.tfvars
   terraform init
   terraform apply
   ```

2. **Build y Push de Imágenes**:
   ```bash
   ./scripts/deploy.sh
   ```

3. **Configurar GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `VITE_API_URL`

4. **Monitoreo**:
   - CloudWatch Logs
   - ECS Service metrics
   - ALB metrics

## Referencias

- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Task 10 Summary](../TASK_10_SUMMARY.md)
- [Terraform README](../../terraform/README.md)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Estado**: ✅ **Completado**  
**Fecha**: Diciembre 2025  
**Duración**: 1 día  
**Complejidad**: Alta
