import path from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.VITE_DEV_API_TARGET = 'http://127.0.0.1:3101';

const viteEntry = path.resolve('frontend/node_modules/vite/dist/node/index.js');
const { createServer } = await import(pathToFileURL(viteEntry).href);
const server = await createServer({
  root: path.resolve('frontend'),
  configFile: path.resolve('frontend/vite.config.js'),
  server: { host: '127.0.0.1', port: 5190, strictPort: true }
});

await server.listen();
server.printUrls();

async function shutdown() {
  await server.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
