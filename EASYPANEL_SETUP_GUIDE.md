# 🚀 Guía de Configuración: Evolution API con EasyPanel

## ✅ Estado Actual

EasyPanel está instalado y funcionando en: **http://localhost:3000**

## 📋 Pasos para Configurar Evolution API

### Paso 1: Acceder a EasyPanel

1. Abre tu navegador y ve a: **http://localhost:3000**
2. Completa la configuración inicial:
   - Crea tu usuario administrador
   - Establece una contraseña segura
   - Configura tu dominio principal (puedes usar `localhost` para desarrollo)

### Paso 2: Crear un Nuevo Proyecto

1. Una vez dentro del dashboard de EasyPanel:
   - Click en **"Create Project"** o **"Nuevo Proyecto"**
   - Nombre del proyecto: `task-manager` (o el que prefieras)
   - Click en **"Create"**

### Paso 3: Desplegar Evolution API

Dentro de tu proyecto, tienes dos opciones:

#### Opción A: Usar el Template de Evolution API (Recomendado) ⭐

1. Click en **"Create Service"** o **"Nuevo Servicio"**
2. Busca **"Evolution API"** en los templates disponibles
3. Si aparece el template:
   - Click en **"Use Template"**
   - Configura:
     - **Service Name:** `evolution-api`
     - **API Key:** `4068cdd0ccc0db2342212054c62ab39be883db930d3b11d76edbea30a36a7daf`
   - Click en **"Deploy"**

#### Opción B: Configuración Manual

Si no encuentras el template, crea un servicio manualmente:

1. Click en **"Create Service"** → **"App"**
2. Configura el servicio:

**General:**
- **Service Name:** `evolution-api`
- **Image:** `atendai/evolution-api:latest`

**Ports:**
- **Container Port:** `8080`
- **Published Port:** `8080`
- **Protocol:** `HTTP`

**Environment Variables:**
Agrega las siguientes variables:

```
AUTHENTICATION_API_KEY=4068cdd0ccc0db2342212054c62ab39be883db930d3b11d76edbea30a36a7daf
SERVER_TYPE=http
SERVER_PORT=8080
SERVER_URL=http://localhost:8080
DATABASE_ENABLED=false
CACHE_REDIS_ENABLED=false
LOG_LEVEL=WARN
LOG_COLOR=true
DEL_INSTANCE=false
QRCODE_LIMIT=30
```

**Volumes:**
- **Mount Path:** `/evolution/instances`
- **Volume Name:** `evolution-instances`

3. Click en **"Deploy"**

### Paso 4: Esperar el Despliegue

1. EasyPanel descargará la imagen de Evolution API
2. Iniciará el contenedor
3. Verás el estado cambiar a **"Running"** (puede tomar 1-2 minutos)

### Paso 5: Acceder a Evolution API

1. Una vez que el servicio esté **"Running"**:
   - Click en el servicio `evolution-api`
   - Busca la URL del servicio (debería ser algo como `http://localhost:8080`)
   - O simplemente abre: **http://localhost:8080**

2. Verifica que Evolution API esté funcionando:
   - Deberías ver un mensaje JSON: `{"status":200,"message":"Welcome to the Evolution API..."}`

### Paso 6: Acceder al Manager UI

1. Abre: **http://localhost:8080/manager**
2. Deberás ver la interfaz del Manager de Evolution API

### Paso 7: Crear Instancia de WhatsApp

En el Manager UI:

1. Click en **"Create Instance"** o **"Nueva Instancia"**
2. Configura:
   - **Instance Name:** `task-manager`
   - **Integration:** `WHATSAPP-BAILEYS`
   - **QR Code:** Activado
3. Click en **"Create"**

### Paso 8: Obtener y Escanear el Código QR

1. Una vez creada la instancia, deberías ver el código QR automáticamente
2. Si no aparece, click en **"Connect"** o **"Get QR Code"**
3. **Escanea el código QR con WhatsApp:**
   - Abre WhatsApp en tu teléfono
   - Ve a **Configuración** → **Dispositivos vinculados**
   - Toca **Vincular un dispositivo**
   - Escanea el código QR

4. Espera la confirmación de conexión
5. El estado debería cambiar a **"Connected"** o **"open"**

### Paso 9: Verificar Conexión

Verifica que WhatsApp esté conectado:

```bash
curl -X GET http://localhost:8080/instance/connectionState/task-manager \
  -H "apikey: 4068cdd0ccc0db2342212054c62ab39be883db930d3b11d76edbea30a36a7daf"
```

Respuesta esperada:
```json
{
  "instance": {
    "instanceName": "task-manager",
    "state": "open"
  }
}
```

### Paso 10: Actualizar Configuración del Backend

Una vez que WhatsApp esté conectado, actualiza el archivo `.env` del backend:

```bash
# WhatsApp Integration (Evolution API via EasyPanel)
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=4068cdd0ccc0db2342212054c62ab39be883db930d3b11d76edbea30a36a7daf
WHATSAPP_INSTANCE_ID=task-manager

# Reminders
REMINDERS_ENABLED=true
```

### Paso 11: Reiniciar el Backend

```bash
cd backend
npm run start:dev
```

### Paso 12: Probar el Envío de Mensajes

1. **Desde el Frontend:**
   - Ve a `http://localhost:5173/dashboard/notifications`
   - Configura tu número de WhatsApp (con código de país)
   - Activa las notificaciones
   - Click en el botón **"Test"**

2. **Desde la API:**
```bash
curl -X POST http://localhost:3000/reminders/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Verifica que recibas el mensaje en WhatsApp** ✅

## 🎯 Ventajas de Usar EasyPanel

✅ **Interfaz gráfica intuitiva** - No necesitas editar archivos YAML
✅ **Gestión de servicios fácil** - Start, stop, restart con un click
✅ **Logs en tiempo real** - Ver logs directamente en la interfaz
✅ **Actualizaciones simples** - Actualizar a nuevas versiones con un click
✅ **Múltiples proyectos** - Puedes gestionar otros servicios también
✅ **Configuración estable** - Resuelve el problema del loop de reinicio

## 🔧 Comandos Útiles

### Ver servicios de EasyPanel
```bash
docker service ls
```

### Ver logs de Evolution API
En la interfaz de EasyPanel:
- Click en el servicio `evolution-api`
- Tab **"Logs"**

O desde terminal:
```bash
docker service logs easypanel_evolution-api -f
```

### Reiniciar Evolution API
En la interfaz de EasyPanel:
- Click en el servicio `evolution-api`
- Click en **"Restart"**

### Detener EasyPanel
```bash
docker service rm easypanel
docker service rm traefik
```

### Desinstalar EasyPanel completamente
```bash
docker swarm leave --force
sudo rm -rf /etc/easypanel
```

## 📊 Monitoreo

En EasyPanel puedes ver:
- **Estado del servicio:** Running, Stopped, Error
- **Uso de recursos:** CPU, Memoria, Red
- **Logs en tiempo real**
- **Variables de entorno**
- **Volúmenes y datos persistentes**

## 🐛 Troubleshooting

### Problema: No puedo acceder a http://localhost:3000
**Solución:**
```bash
# Verificar que EasyPanel esté corriendo
docker ps | grep easypanel

# Si no está corriendo, reiniciar
docker service scale easypanel=1
```

### Problema: Evolution API no inicia
**Solución:**
1. Ve a EasyPanel → Servicio `evolution-api` → **Logs**
2. Busca errores en los logs
3. Verifica que todas las variables de entorno estén correctas
4. Reinicia el servicio

### Problema: El QR code no aparece
**Solución:**
1. Verifica que el servicio esté en estado **"Running"**
2. Espera 30 segundos después de crear la instancia
3. Refresca el Manager UI
4. Si persiste, elimina la instancia y créala nuevamente

### Problema: La instancia se desconecta
**Solución:**
1. Verifica los logs en EasyPanel
2. Asegúrate de que no haya problemas de red
3. Reconecta escaneando el QR nuevamente

## 🎉 Siguiente Paso

Una vez que WhatsApp esté conectado y funcionando:

1. ✅ Configura tu usuario en el frontend
2. ✅ Prueba el envío de mensajes
3. ✅ Crea tareas de prueba
4. ✅ Verifica que los recordatorios automáticos funcionen
5. ✅ Documenta el proceso completo

## 📚 Recursos

- **EasyPanel Docs:** https://easypanel.io/docs
- **Evolution API Docs:** https://doc.evolution-api.com
- **EasyPanel Dashboard:** http://localhost:3000
- **Evolution API:** http://localhost:8080
- **Evolution Manager:** http://localhost:8080/manager

---

**Configurado por:** AI Assistant  
**Fecha:** 7 de Diciembre, 2025  
**Estado:** ✅ EasyPanel instalado - Listo para desplegar Evolution API
