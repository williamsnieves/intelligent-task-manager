# 🏗️ Terraform Infrastructure

Infrastructure as Code para Intelligent Task Manager en AWS.

## 📁 Estructura

```
terraform/
├── main.tf                 # Configuración principal
├── variables.tf            # Variables globales
├── outputs.tf             # Outputs de infraestructura
├── modules/               # Módulos reutilizables
│   ├── vpc/              # VPC, subnets, routing
│   ├── security/         # Security groups
│   ├── ecr/              # Container registry
│   ├── alb/              # Application Load Balancer
│   ├── rds/              # DocumentDB (MongoDB)
│   └── ecs/              # ECS Fargate services
└── environments/          # Configuraciones por entorno
    ├── dev/
    │   ├── main.tf
    │   └── terraform.tfvars.example
    └── prod/
        ├── main.tf
        └── terraform.tfvars.example
```

## 🚀 Quick Start

### 1. Configurar Entorno

```bash
cd environments/dev
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores
```

### 2. Inicializar Terraform

```bash
terraform init
```

### 3. Planificar Cambios

```bash
terraform plan
```

### 4. Aplicar Infraestructura

```bash
terraform apply
```

## 📦 Módulos

### VPC Module

Crea:
- VPC con CIDR configurable
- 2 subnets públicas (para ALB)
- 2 subnets privadas (para ECS y RDS)
- Internet Gateway
- NAT Gateway
- Route tables

### Security Module

Crea:
- ALB Security Group (permite HTTP/HTTPS)
- ECS Security Group (permite tráfico desde ALB)
- DB Security Group (permite MongoDB desde ECS)

### ECR Module

Crea:
- Repositorio para backend
- Repositorio para frontend
- Lifecycle policies (mantiene últimas 5 imágenes)

### ALB Module

Crea:
- Application Load Balancer
- Target groups para backend y frontend
- Listener rules para routing

### RDS Module

Crea:
- DocumentDB cluster (MongoDB-compatible)
- Subnet group
- Parameter group

**Alternativa**: Usar MongoDB Atlas Free Tier (recomendado para costo cero)

### ECS Module

Crea:
- ECS Cluster
- Task definitions para backend y frontend
- ECS Services con Fargate
- IAM roles y policies
- CloudWatch log groups

## 🔧 Variables Importantes

| Variable | Descripción | Default |
|----------|-------------|---------|
| `aws_region` | Región de AWS | `us-east-1` |
| `environment` | Entorno (dev/prod) | `dev` |
| `vpc_cidr` | CIDR de VPC | `10.0.0.0/16` |
| `backend_cpu` | CPU para backend (256 = 0.25 vCPU) | `256` |
| `backend_memory` | Memoria para backend (MB) | `512` |
| `desired_count` | Número de tareas | `1` |

## 📊 Outputs

Después de `terraform apply`:

```bash
terraform output

# Outputs:
# - alb_dns_name: URL del load balancer
# - backend_url: URL del API
# - frontend_url: URL de la aplicación
# - ecr_backend_repository_url: URL del registry de backend
# - ecr_frontend_repository_url: URL del registry de frontend
```

## 💰 Costos Estimados

### Configuración Estándar (~$120-140/mes)

- ECS Fargate: ~$15-30/mes
- DocumentDB: ~$50/mes
- ALB: ~$16/mes
- NAT Gateway: ~$32/mes
- CloudWatch: ~$5/mes

### Configuración Optimizada (~$15-30/mes)

- MongoDB Atlas Free Tier: $0
- ECS Fargate: ~$15-30/mes
- ALB: ~$16/mes
- Sin NAT Gateway: $0
- CloudWatch: ~$5/mes

## 🔒 Seguridad

### Secrets Management

**NO** incluir secrets en `terraform.tfvars`. Usar:

1. **AWS Secrets Manager** (recomendado para producción)
2. **Variables de entorno** en CI/CD
3. **Terraform Cloud** para state remoto seguro

### Best Practices

- ✅ Usar subnets privadas para ECS y RDS
- ✅ Habilitar encryption at rest
- ✅ Usar IAM roles con mínimos privilegios
- ✅ Habilitar CloudWatch Logs
- ✅ Usar HTTPS en producción (ACM + Route53)

## 🧪 Testing

### Validar Configuración

```bash
terraform validate
terraform fmt -check
```

### Plan sin Aplicar

```bash
terraform plan -out=tfplan
```

### Aplicar Plan Guardado

```bash
terraform apply tfplan
```

## 🗑️ Destruir Infraestructura

⚠️ **CUIDADO**: Esto eliminará todos los recursos.

```bash
terraform destroy
```

## 📚 Referencias

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🤝 Contribuir

1. Crear rama feature
2. Hacer cambios en módulos
3. Ejecutar `terraform fmt`
4. Ejecutar `terraform validate`
5. Crear PR con descripción de cambios

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2025
