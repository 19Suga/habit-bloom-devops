import path from 'node:path';

process.env.DATABASE_PATH = path.resolve('backend/data/e2e-test.db');
process.env.JWT_SECRET = 'e2e-secret';
process.env.FRONTEND_URL = 'http://127.0.0.1:5190';

const { startServer } = await import('../backend/src/server.js');
const server = startServer(3101);

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
