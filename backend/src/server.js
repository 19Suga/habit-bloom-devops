import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { pathToFileURL } from 'node:url';
import { createToken, requireAuth } from './auth.js';
import { db } from './database.js';
import { calculateStreaks, shiftDate, todayKey } from './streaks.js';

export const app = express();
const port = Number(process.env.PORT || 3001);
const allowedCategories = new Set(['agua', 'movimiento', 'estudio', 'lectura', 'bienestar']);
const allowedColors = new Set(['rose', 'lavender', 'sage', 'peach']);

const configuredOrigin = process.env.FRONTEND_URL;
const isLocalDevelopmentOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
const isCloudflareQuickTunnelOrigin = (origin) => /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/i.test(origin);
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === configuredOrigin || isLocalDevelopmentOrigin(origin) || isCloudflareQuickTunnelOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS.'));
  }
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) return res.status(400).json({ message: 'Completa todos los campos.' });
  if (name.length > 80) return res.status(400).json({ message: 'El nombre es demasiado largo.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Escribe un correo válido.' });
  if (password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });

  try {
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name, email, bcrypt.hashSync(password, 12));
    const user = { id: Number(result.lastInsertRowid), name, email };
    return res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Ese correo ya está registrado.' });
    throw error;
  }
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
  }
  const safeUser = { id: user.id, name: user.name, email: user.email };
  return res.json({ user: safeUser, token: createToken(safeUser) });
});

app.get('/api/habits', requireAuth, (req, res) => {
  const today = todayKey();
  const week = Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const completionsQuery = db.prepare('SELECT completed_on FROM completions WHERE habit_id = ? ORDER BY completed_on');

  const result = habits.map((habit) => {
    const completionDates = completionsQuery.all(habit.id).map((row) => row.completed_on);
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      color: habit.color,
      doneToday: completionDates.includes(today),
      week: week.map((day) => ({ day, completed: completionDates.includes(day) })),
      ...calculateStreaks(completionDates, today)
    };
  });

  return res.json({ habits: result, today });
});

app.post('/api/habits', requireAuth, (req, res) => {
  const name = String(req.body.name || '').trim();
  const category = allowedCategories.has(req.body.category) ? req.body.category : 'bienestar';
  const color = allowedColors.has(req.body.color) ? req.body.color : 'rose';
  if (!name) return res.status(400).json({ message: 'Escribe un nombre para tu hábito.' });
  if (name.length > 80) return res.status(400).json({ message: 'Usa un nombre de máximo 80 caracteres.' });

  const result = db.prepare('INSERT INTO habits (user_id, name, category, color) VALUES (?, ?, ?, ?)')
    .run(req.user.id, name, category, color);
  return res.status(201).json({ id: Number(result.lastInsertRowid), message: `${name} se unió a tu jardín.` });
});

app.post('/api/habits/:id/today', requireAuth, (req, res) => {
  const habit = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!habit) return res.status(404).json({ message: 'Hábito no encontrado.' });

  const today = todayKey();
  const completion = db.prepare('SELECT id FROM completions WHERE habit_id = ? AND completed_on = ?').get(habit.id, today);
  if (completion) {
    db.prepare('DELETE FROM completions WHERE id = ?').run(completion.id);
    return res.json({ doneToday: false, message: 'Marcación deshecha.' });
  }
  db.prepare('INSERT INTO completions (habit_id, completed_on) VALUES (?, ?)').run(habit.id, today);
  return res.json({ doneToday: true, message: '¡Hecho por hoy! Tu constancia está floreciendo.' });
});

app.delete('/api/habits/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!result.changes) return res.status(404).json({ message: 'Hábito no encontrado.' });
  return res.json({ message: 'Hábito eliminado.' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Ocurrió un error inesperado.' });
});

export function startServer(listenPort = port) {
  return app.listen(listenPort, () => console.log(`Habit Bloom API: http://localhost:${listenPort}`));
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) startServer();
