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

- [ ] Dockerfile del frontend.
- [ ] Dockerfile del backend.
- [ ] `docker-compose.yml` con dos servicios y volumen para SQLite.
- [ ] Pipeline de GitHub Actions en `main`.
- [ ] Construcción de imágenes y publicación en Docker Hub.

## Etapa 4 — Infraestructura

- [ ] Terraform para crear VM Ubuntu 24.04, VPC, subred e IP pública.
- [ ] Configuración de la VM con Docker y Git.
- [ ] Firewall e iptables para los puertos 80 y 443.
- [ ] Despliegue automático del proyecto.

## Puntos adicionales

- [ ] Configuración de la VM con Ansible.
- [ ] Dominio o URL mediante Cloudflare.
