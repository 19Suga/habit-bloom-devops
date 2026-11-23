import { db } from './database.js';

const users = db.prepare(`
  SELECT id, name, email, created_at
  FROM users
  ORDER BY id
`).all();

const habits = db.prepare(`
  SELECT habits.id, habits.name, habits.category, habits.color,
         users.email AS user_email, habits.created_at
  FROM habits
  JOIN users ON users.id = habits.user_id
  ORDER BY habits.id
`).all();

const completions = db.prepare(`
  SELECT completions.id, habits.name AS habit,
         completions.completed_on
  FROM completions
  JOIN habits ON habits.id = completions.habit_id
  ORDER BY completions.completed_on, completions.id
`).all();

console.log('\nUSUARIOS');
console.table(users);
console.log('\nHÁBITOS');
console.table(habits);
console.log('\nREGISTROS DIARIOS');
console.table(completions);

db.close();
