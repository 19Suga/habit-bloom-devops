import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('.');
const database = path.resolve('backend/data/e2e-test.db');
const playwrightCli = path.resolve('node_modules/@playwright/test/cli.js');
const localBrowsers = path.resolve('.playwright');
const children = [];

function cleanDatabase() {
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${database}${suffix}`, { force: true });
}

function start(script) {
  const child = spawn(process.execPath, [script], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit'
  });
  children.push(child);
  return child;
}

async function waitFor(url, child) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`El servidor terminó antes de responder: ${url}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // El servidor todavía está iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Tiempo agotado esperando: ${url}`);
}

function stop(child) {
  if (child.exitCode === null) child.kill('SIGTERM');
}

cleanDatabase();
let exitCode = 1;

try {
  const backend = start('e2e/start-backend.js');
  await waitFor('http://127.0.0.1:3101/api/health', backend);
  const frontend = start('e2e/start-frontend.js');
  await waitFor('http://127.0.0.1:5190', frontend);

  const tests = spawn(process.execPath, [playwrightCli, 'test'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PLAYWRIGHT_EXTERNAL_SERVERS: '1',
      ...(fs.existsSync(localBrowsers) ? { PLAYWRIGHT_BROWSERS_PATH: localBrowsers } : {})
    },
    stdio: 'inherit'
  });
  exitCode = await new Promise((resolve) => tests.once('exit', (code) => resolve(code ?? 1)));
} finally {
  for (const child of children.reverse()) stop(child);
  await new Promise((resolve) => setTimeout(resolve, 500));
  cleanDatabase();
}

process.exitCode = exitCode;
