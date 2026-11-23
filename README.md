# Habit Bloom

Aplicación MVP para registrar hábitos y cuidar rachas diarias. Usa React con Vite en el frontend, Node.js con Express en el backend y SQLite mediante `better-sqlite3`.

## Funciones incluidas

- Registro e inicio de sesión.
- Contraseñas protegidas con hash.
- Creación y eliminación de hábitos.
- Marcación y desmarcación del hábito del día.
- Racha actual y mejor racha.
- Actividad de los últimos siete días.
- Resumen de progreso semanal.
- Datos separados por usuario.

## Requisitos

- Node.js 20 o superior.
- npm.
- Docker Desktop, solamente para la ejecución con contenedores.

## Ejecución rápida en Windows

Haz doble clic en `iniciar.bat`. También puedes abrir una terminal en la carpeta principal y ejecutar:

```bash
npm install
npm run setup
npm run dev
```

Abre `http://localhost:5173`. La API se ejecuta en `http://localhost:3001`.

## Ejecución con Docker

Docker ejecuta el frontend compilado en Nginx y el backend en Node.js. Nginx sirve la aplicación React y envía las solicitudes de `/api` al contenedor del backend.

```bash
docker compose build
docker compose up -d
docker compose ps
```

Abre `http://localhost`. La comprobación de salud está disponible a través de Nginx en `http://localhost/api/health` y directamente en `http://localhost:3001/api/health`.

Para ver los registros o detener la aplicación:

```bash
docker compose logs -f
docker compose down
```

Los datos de SQLite se guardan en el volumen nombrado `habit-bloom-react_habit_bloom_data`, por lo que sobreviven a `docker compose down` y a la recreación de los contenedores. No uses `docker compose down -v` si deseas conservarlos.

Para personalizar `JWT_SECRET` y `APP_TIMEZONE`, crea un archivo `.env` desde `.env.example`. Antes de un despliegue real debes reemplazar la clave JWT de ejemplo.

## Estructura

```text
habit-bloom/
├── frontend/          React + Vite, Dockerfile y Nginx
├── backend/           Express + better-sqlite3 y Dockerfile
├── infra/terraform/   infraestructura de Oracle Cloud
├── infra/ansible/     configuración y despliegue de la VM
├── docker-compose.yml servicios y volumen persistente
├── CHECKLIST.md       avance de la práctica
├── iniciar.bat        inicio automático en Windows
└── package.json       comandos generales
```

La base de datos se crea automáticamente en `backend/data/habit-bloom.db`. No debes crearla manualmente.

## Comandos

- `npm run dev`: inicia frontend y backend.
- `npm run build`: genera la versión de producción del frontend.
- `npm start`: inicia solamente la API.
- `npm run db:show`: muestra en la terminal los usuarios, hábitos y registros guardados en SQLite.
- `npm run test:unit`: ejecuta las 6 pruebas unitarias.
- `npm run test:integration`: ejecuta las 6 pruebas de integración.
- `npm run test:e2e`: ejecuta las 6 pruebas E2E con Playwright.
- `npm test`: ejecuta las 18 pruebas en orden.

Antes de ejecutar las pruebas E2E por primera vez, instala Chromium con `npx playwright install chromium`.

## Integración continua

El workflow `.github/workflows/dev.yml` ejecuta las 18 pruebas automatizadas y compila el frontend en cada `push` a `dev` y en cada pull request dirigido a `dev`. También puede iniciarse manualmente desde GitHub Actions.

El workflow `.github/workflows/main.yml` construye las imágenes del frontend y backend en cada `push` a `main` y las publica en Docker Hub con las etiquetas `latest` y el SHA del commit:

- `rln24/habit-bloom-frontend`
- `rln24/habit-bloom-backend`

El repositorio de GitHub necesita los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`. Ambos están configurados en GitHub Actions; sus valores no se guardan en el código.

Para descargar las imágenes publicadas sin reconstruirlas localmente:

```bash
docker compose pull
docker compose up -d --no-build
```

## Infraestructura con Terraform

La carpeta `infra/terraform` contiene la base para crear en Oracle Cloud una VCN, una subred pública, un Internet Gateway, una IP pública reservada y una VM flexible con Ubuntu 24.04. La imagen se selecciona automáticamente entre las imágenes compatibles disponibles en la región elegida. Las imágenes de la aplicación se publican para `linux/amd64` y `linux/arm64`.

Los valores reales de la cuenta se guardarán en `infra/terraform/terraform.tfvars`, archivo excluido de Git. Consulta `infra/terraform/README.md` para seguir la configuración de OCI paso a paso. No ejecutes `terraform apply` sin revisar primero el plan.

## Despliegue en Oracle Cloud

Habit Bloom está desplegado en una VM Ubuntu 24.04 de Oracle Cloud:

- Aplicación: `http://147.15.108.94`
- API de salud: `http://147.15.108.94/api/health`
- Shape: `VM.Standard.E3.Flex`, 1 OCPU y 4 GB de RAM.
- Docker y Git instalados mediante Ansible.
- UFW activo con SSH restringido a la IP administrativa.
- Puertos 80 y 443 habilitados en OCI, UFW e iptables.
- SQLite persiste en un volumen Docker de la VM.

El puerto 443 está preparado, pero HTTPS se configurará cuando se agregue un dominio o Cloudflare. La VM E3 consume créditos de la suscripción mientras está encendida; revisa periódicamente **Billing & Cost Management → Usage** en OCI.

## Ver la base de datos

`backend/data/habit-bloom.db` es un archivo binario SQLite, por lo que no se puede leer como un archivo de texto. Para consultar sus datos sin instalar nada adicional, ejecuta `npm run db:show` desde la carpeta principal. También puedes instalar en VS Code una extensión como **SQLite Viewer** y abrir el archivo con esa extensión.

## Variables de entorno

Copia `.env.example` como `.env` cuando necesites personalizar la configuración. Para producción debes cambiar `JWT_SECRET`.
