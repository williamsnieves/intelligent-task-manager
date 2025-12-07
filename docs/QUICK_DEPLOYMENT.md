# 🚀 Quick Deployment Guide - AWS Testing

**Objetivo**: Desplegar temporalmente en AWS para validar el proceso, luego destruir.

**Tiempo estimado**: 45 minutos  
**Costo estimado**: ~$5-10 (si lo destruyes el mismo día)

---

## ⚠️ IMPORTANTE: Minimizar Costos

Para este test, vamos a:
1. ✅ Usar MongoDB Atlas Free Tier (en lugar de DocumentDB)
2. ✅ Mantener la infraestructura solo unas horas
3. ✅ Destruir todo al finalizar

**Costo real**: ~$5-10 por el día de prueba

---

## 📋 Checklist Pre-Deployment

- [ ] Cuenta AWS activa
- [ ] AWS CLI configurado (`aws configure`)
- [ ] Terraform instalado (`terraform --version`)
- [ ] Docker instalado y corriendo
- [ ] Cuenta MongoDB Atlas creada

---

## 🗄️ Paso 1: Configurar MongoDB Atlas (5 min)

### 1.1 Crear Cluster Gratuito

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta (gratis)
3. Crea un nuevo cluster:
   - **Tier**: M0 (Free)
   - **Provider**: AWS
   - **Region**: us-east-1 (mismo que tu deployment)
   - **Cluster Name**: intelligent-task-manager

### 1.2 Configurar Acceso

1. **Database Access** → Add New Database User:
   - Username: `taskmanager`
   - Password: (genera uno seguro y guárdalo)
   - Role: `Atlas admin`

2. **Network Access** → Add IP Address:
   - Selecciona: "Allow access from anywhere" (0.0.0.0/0)
   - (Solo para testing, en producción usa IPs específicas)

### 1.3 Obtener Connection String

1. Click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Copia el connection string:
   ```
   mongodb+srv://taskmanager:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con tu password
5. Agrega el nombre de la base de datos:
   ```
   mongodb+srv://taskmanager:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority
   ```

---

## ⚙️ Paso 2: Configurar Terraform (5 min)

### 2.1 Crear archivo de configuración

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

### 2.2 Editar `terraform.tfvars`

```hcl
aws_region   = "us-east-1"
project_name = "intelligent-task-manager"
environment  = "dev"
vpc_cidr     = "10.0.0.0/16"

# Placeholders (no se usarán)
db_username = "PLACEHOLDER"
db_password = "PLACEHOLDER"

# JWT Secret (genera uno aleatorio)
jwt_secret = "tu-jwt-secret-super-seguro-aqui"

# WhatsApp (dejar vacío por ahora)
whatsapp_api_url     = ""
whatsapp_api_key     = ""
whatsapp_instance_id = "task-manager"

# Ollama (dejar vacío por ahora)
ollama_api_url = ""

# ECS Config (mínimo para testing)
backend_cpu      = 256
backend_memory   = 512
frontend_cpu     = 256
frontend_memory  = 512
desired_count    = 1
```

### 2.3 Modificar main.tf para usar MongoDB Atlas

```bash
cd ../../  # Volver a terraform/
```

**Opción A - Comentar módulo RDS**:

Edita `terraform/main.tf` y comenta el módulo RDS:

```hcl
# ================================
# RDS Module (DocumentDB) - COMMENTED OUT
# Using MongoDB Atlas instead
# ================================
# module "rds" {
#   source = "./modules/rds"
#   ...
# }
```

**Opción B - Usar archivo alternativo**:

```bash
# Backup del original
mv main.tf main-with-documentdb.tf

# Usar versión con Atlas
cp main-with-atlas.tf.example main.tf
```

### 2.4 Actualizar ECS Module

Edita `terraform/modules/ecs/main.tf`, busca la sección de environment variables y actualiza:

```hcl
environment = [
  {
    name  = "MONGODB_URI"
    value = "mongodb+srv://taskmanager:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority"
  },
  # ... resto de variables
]
```

---

## 🏗️ Paso 3: Crear Infraestructura AWS (15 min)

### 3.1 Inicializar Terraform

```bash
cd terraform/environments/dev
terraform init
```

### 3.2 Validar Configuración

```bash
terraform validate
terraform fmt -recursive
```

### 3.3 Ver Plan de Ejecución

```bash
terraform plan
```

Deberías ver ~35-40 recursos a crear (sin DocumentDB).

### 3.4 Aplicar Infraestructura

```bash
terraform apply
```

Escribe `yes` cuando te lo pida.

⏱️ **Tiempo**: ~10-15 minutos

**Recursos creados**:
- VPC con subnets públicas y privadas
- NAT Gateway
- Application Load Balancer
- ECS Cluster
- ECR Repositories
- Security Groups
- IAM Roles

### 3.5 Guardar Outputs

```bash
terraform output > outputs.txt
cat outputs.txt
```

Guarda especialmente:
- `alb_dns_name`
- `ecr_backend_repository_url`
- `ecr_frontend_repository_url`

---

## 🐳 Paso 4: Build y Push de Imágenes (10 min)

### 4.1 Login a ECR

```bash
cd ../../../  # Volver a root del proyecto

# Obtener URL de ECR
BACKEND_ECR=$(cd terraform/environments/dev && terraform output -raw ecr_backend_repository_url)
FRONTEND_ECR=$(cd terraform/environments/dev && terraform output -raw ecr_frontend_repository_url)
ALB_DNS=$(cd terraform/environments/dev && terraform output -raw alb_dns_name)

# Login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${BACKEND_ECR%/*}
```

### 4.2 Build y Push Backend

```bash
cd backend

docker build -t intelligent-task-manager-dev-backend .
docker tag intelligent-task-manager-dev-backend:latest $BACKEND_ECR:latest
docker push $BACKEND_ECR:latest

cd ..
```

### 4.3 Build y Push Frontend

```bash
cd frontend

docker build \
  --build-arg VITE_API_URL=http://$ALB_DNS/api \
  -t intelligent-task-manager-dev-frontend .

docker tag intelligent-task-manager-dev-frontend:latest $FRONTEND_ECR:latest
docker push $FRONTEND_ECR:latest

cd ..
```

---

## 🚀 Paso 5: Deploy a ECS (5 min)

### 5.1 Forzar Deployment

```bash
# Backend
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-backend-service \
  --force-new-deployment \
  --region us-east-1

# Frontend
aws ecs update-service \
  --cluster intelligent-task-manager-dev-cluster \
  --service intelligent-task-manager-dev-frontend-service \
  --force-new-deployment \
  --region us-east-1
```

### 5.2 Monitorear Deployment

```bash
# Ver logs de backend
aws logs tail /ecs/intelligent-task-manager-dev-backend --follow

# En otra terminal, ver logs de frontend
aws logs tail /ecs/intelligent-task-manager-dev-frontend --follow
```

### 5.3 Esperar Estabilidad

```bash
aws ecs wait services-stable \
  --cluster intelligent-task-manager-dev-cluster \
  --services intelligent-task-manager-dev-backend-service \
  --region us-east-1
```

---

## ✅ Paso 6: Validar Deployment (5 min)

### 6.1 Verificar Backend

```bash
ALB_DNS=$(cd terraform/environments/dev && terraform output -raw alb_dns_name)

# Health check
curl http://$ALB_DNS/health

# Debería devolver: {"status":"ok","timestamp":"..."}
```

### 6.2 Verificar Frontend

```bash
# Abrir en navegador
open "http://$ALB_DNS"
```

### 6.3 Probar Aplicación

1. Registrar usuario
2. Crear proyecto
3. Crear tarea
4. Verificar que todo funciona

---

## 🗑️ Paso 7: Destruir Infraestructura (5 min)

### ⚠️ IMPORTANTE: Hacer esto al terminar para evitar costos

```bash
cd terraform/environments/dev

# Ver qué se va a destruir
terraform plan -destroy

# Destruir todo
terraform destroy
```

Escribe `yes` cuando te lo pida.

⏱️ **Tiempo**: ~5 minutos

**Esto eliminará**:
- Todas las instancias ECS
- Load Balancer
- NAT Gateway
- VPC y subnets
- ECR repositories (con las imágenes)
- Security Groups
- IAM Roles

**NO eliminará**:
- MongoDB Atlas (es gratis, puedes dejarlo)
- Logs de CloudWatch (se borran automáticamente después de 7 días)

---

## 💰 Resumen de Costos

### Durante el Test (1 día)

| Servicio | Costo/día |
|----------|-----------|
| ECS Fargate (2 tareas) | ~$0.50-1.00 |
| ALB | ~$0.50 |
| NAT Gateway | ~$1.00 |
| Data Transfer | ~$0.50 |
| CloudWatch Logs | ~$0.10 |
| **Total** | **~$2.60-3.10/día** |

### Si lo dejas corriendo 1 mes

| Servicio | Costo/mes |
|----------|-----------|
| ECS Fargate | ~$15-30 |
| ALB | ~$16 |
| NAT Gateway | ~$32 |
| Data Transfer | ~$5 |
| CloudWatch | ~$5 |
| **Total** | **~$73-88/mes** |

---

## 🐛 Troubleshooting

### Error: "No space left on device"

```bash
docker system prune -a
```

### Error: "Access Denied" en ECR

```bash
# Re-login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_URL>
```

### Tasks no inician en ECS

```bash
# Ver eventos del servicio
aws ecs describe-services \
  --cluster intelligent-task-manager-dev-cluster \
  --services intelligent-task-manager-dev-backend-service \
  --query 'services[0].events[0:5]'
```

### ALB devuelve 502/503

```bash
# Verificar health checks
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN>
```

---

## 📊 Checklist Final

- [ ] MongoDB Atlas configurado
- [ ] Terraform aplicado exitosamente
- [ ] Imágenes Docker pusheadas a ECR
- [ ] Servicios ECS corriendo
- [ ] Backend responde en `/health`
- [ ] Frontend carga correctamente
- [ ] Aplicación funcional
- [ ] **Infraestructura destruida** (`terraform destroy`)

---

## 🎓 Lo que Aprendiste

1. ✅ Infrastructure as Code con Terraform
2. ✅ Deployment a AWS ECS Fargate
3. ✅ Docker multi-stage builds
4. ✅ AWS networking (VPC, subnets, security groups)
5. ✅ Load balancing con ALB
6. ✅ Container registry con ECR
7. ✅ Monitoring con CloudWatch

---

**¡Listo!** Ahora tienes un template funcional de deployment a AWS que puedes compartir en tu repo con placeholders.

**Siguiente paso**: Commit y push de los cambios para tener todo documentado.
