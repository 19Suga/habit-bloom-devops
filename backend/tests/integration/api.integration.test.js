import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const testFile = fileURLToPath(import.meta.url);
const testDatabase = path.resolve(path.dirname(testFile), '../../data/integration-test.db');
process.env.DATABASE_PATH = testDatabase;
process.env.JWT_SECRET = 'integration-test-secret';

let app;
let db;

function removeTestDatabase() {
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${testDatabase}${suffix}`, { force: true });
}

async function registerUser(email = 'ana@example.com') {
  return request(app).post('/api/auth/register').send({ name: 'Ana', email, password: 'secreto123' });
}

beforeAll(async () => {
  removeTestDatabase();
  ({ app } = await import('../../src/server.js'));
  ({ db } = await import('../../src/database.js'));
});

beforeEach(() => {
  db.exec('DELETE FROM completions; DELETE FROM habits; DELETE FROM users;');
});

afterAll(() => {
  db.close();
  removeTestDatabase();
});

describe('API de Habit Bloom', () => {
  it('responde correctamente en el endpoint de salud', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('registra un usuario y guarda sus datos en SQLite', async () => {
    const response = await registerUser();
    expect(response.status).toBe(201);
    expect(response.body.token).toBeTypeOf('string');
    expect(db.prepare('SELECT name, email FROM users').get()).toEqual({ name: 'Ana', email: 'ana@example.com' });
  });

  it('permite registrar desde una URL HTTPS temporal de Cloudflare', async () => {
    const origin = 'https://habit-bloom-demo.trycloudflare.com';
    const response = await request(app).post('/api/auth/register')
      .set('Origin', origin)
      .send({ name: 'Cloudflare', email: 'cloudflare@example.com', password: 'secreto123' });

    expect(response.status).toBe(201);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  });

  it('rechaza un correo que ya está registrado', async () => {
    await registerUser();
    const response = await registerUser();
    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/ya está registrado/i);
  });

  it('permite iniciar sesión solo con credenciales correctas', async () => {
    await registerUser();
    const valid = await request(app).post('/api/auth/login').send({ email: 'ana@example.com', password: 'secreto123' });
    const invalid = await request(app).post('/api/auth/login').send({ email: 'ana@example.com', password: 'incorrecta' });
    expect(valid.status).toBe(200);
    expect(valid.body.token).toBeTypeOf('string');
    expect(invalid.status).toBe(401);
  });

  it('protege las rutas de hábitos cuando no existe una sesión', async () => {
    const response = await request(app).get('/api/habits');
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/iniciar sesión/i);
  });

  it('completa el ciclo de crear, marcar y eliminar un hábito', async () => {
    const registration = await registerUser();
    const authorization = { Authorization: `Bearer ${registration.body.token}` };
    const created = await request(app).post('/api/habits').set(authorization)
      .send({ name: 'Beber agua', category: 'agua', color: 'sage' });
    expect(created.status).toBe(201);

    const toggled = await request(app).post(`/api/habits/${created.body.id}/today`).set(authorization);
    expect(toggled.body.doneToday).toBe(true);

    const listed = await request(app).get('/api/habits').set(authorization);
    expect(listed.body.habits[0]).toMatchObject({ name: 'Beber agua', doneToday: true, currentStreak: 1 });

    const deleted = await request(app).delete(`/api/habits/${created.body.id}`).set(authorization);
    expect(deleted.status).toBe(200);
    expect(db.prepare('SELECT COUNT(*) AS total FROM habits').get().total).toBe(0);
  });
});
