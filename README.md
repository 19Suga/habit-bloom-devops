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

## Ejecución rápida en Windows

Haz doble clic en `iniciar.bat`. También puedes abrir una terminal en la carpeta principal y ejecutar:

```bash
npm install
npm run setup
npm run dev
```

Abre `http://localhost:5173`. La API se ejecuta en `http://localhost:3001`.

## Estructura

```text
habit-bloom/
├── frontend/        React + Vite
├── backend/         Express + better-sqlite3
├── CHECKLIST.md     avance de la práctica
├── iniciar.bat      inicio automático en Windows
└── package.json     comandos generales
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

## Ver la base de datos

`backend/data/habit-bloom.db` es un archivo binario SQLite, por lo que no se puede leer como un archivo de texto. Para consultar sus datos sin instalar nada adicional, ejecuta `npm run db:show` desde la carpeta principal. También puedes instalar en VS Code una extensión como **SQLite Viewer** y abrir el archivo con esa extensión.

## Variables de entorno

Copia `.env.example` como `.env` cuando necesites personalizar la configuración. Para producción debes cambiar `JWT_SECRET`.
