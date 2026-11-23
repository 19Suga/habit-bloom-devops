# Checklist de la práctica

## Etapa 1 — MVP

- [x] Proyecto pensado para dos integrantes.
- [x] Frontend con React y Vite.
- [x] Backend con Node.js y Express.
- [x] Base de datos SQLite con `better-sqlite3`.
- [x] Registro e inicio de sesión.
- [x] Crear y eliminar hábitos.
- [x] Marcar un hábito como realizado hoy.
- [x] Mostrar racha actual y mejor racha.
- [x] Diseño femenino, elegante y adaptable a móvil.

## Etapa 2 — Pruebas y rama `dev`

- [x] Al menos 6 tests unitarios.
- [x] Al menos 6 tests de integración.
- [x] Al menos 6 tests E2E con Playwright.
- [x] Pipeline de GitHub Actions para ejecutar las pruebas en cada push a `dev`.

## Etapa 3 — Docker y rama `main`

- [x] Dockerfile del frontend con compilación de React y Nginx.
- [x] Dockerfile multi-etapa del backend.
- [x] Nginx sirve React y redirige `/api` al backend.
- [x] `docker-compose.yml` con dos servicios y volumen para SQLite.
- [x] Archivos `.dockerignore` para frontend y backend.
- [x] Imágenes construidas y contenedores saludables en Docker local.
- [x] Frontend, API, registro y persistencia verificados localmente.
- [x] Pipeline de GitHub Actions en `main`.
- [x] Construcción de imágenes y publicación en Docker Hub.

## Etapa 4 — Infraestructura

- [x] Código base de Terraform preparado y documentado.
- [x] VCN, subred pública, Internet Gateway, rutas y reglas de seguridad creadas con Terraform.
- [x] VM flexible Ubuntu 24.04 e IP pública creadas con créditos OCI.
- [x] Terraform crea VM Ubuntu 24.04, VCN, subred e IP pública.
- [x] Configuración de la VM con Docker y Git.
- [x] Firewall e iptables para los puertos 80 y 443.
- [x] Despliegue automático del proyecto.

## Puntos adicionales

- [x] Configuración de la VM con Ansible.
- [ ] Dominio o URL mediante Cloudflare.
