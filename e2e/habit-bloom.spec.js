import { expect, test } from '@playwright/test';

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@habit.local`;
}

async function registerFromUi(page, name = 'Valentina') {
  await page.goto('/');
  await page.getByRole('button', { name: /primera vez aquí/i }).click();
  await page.getByLabel('Tu nombre').fill(name);
  await page.getByLabel('Correo electrónico').fill(uniqueEmail('registro'));
  await page.getByLabel('Contraseña').fill('prueba123');
  await page.getByRole('button', { name: 'Crear mi jardín' }).click();
  await expect(page.getByRole('heading', { name: 'Tu jardín de hoy' })).toBeVisible();
}

async function createHabit(page, name = 'Beber ocho vasos de agua') {
  await page.getByRole('button', { name: 'Crear mi primer hábito', exact: true }).click();
  await page.getByLabel('Nombre del hábito').fill(name);
  await page.getByRole('button', { name: 'Categoría: Bienestar' }).click();
  await page.getByRole('option', { name: /agua/i }).click();
  await page.getByRole('button', { name: 'Guardar hábito' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

test('1. registra una cuenta nueva desde la interfaz', async ({ page }) => {
  await registerFromUi(page, 'Isabel');
  await expect(page.getByText('Hola, Isabel')).toBeVisible();
  await expect(page.getByText('Tu jardín espera su primera semilla')).toBeVisible();
});

test('2. inicia sesión con una cuenta existente', async ({ page, request }) => {
  const email = uniqueEmail('login');
  await request.post('http://127.0.0.1:3101/api/auth/register', {
    data: { name: 'Camila', email, password: 'prueba123' }
  });
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('prueba123');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
  await expect(page.getByText('Hola, Camila')).toBeVisible();
});

test('3. crea un hábito usando el dropdown personalizado', async ({ page }) => {
  await registerFromUi(page);
  await createHabit(page);
  await expect(page.getByText('agua', { exact: true })).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
});

test('4. marca el hábito de hoy y actualiza la racha', async ({ page }) => {
  await registerFromUi(page);
  await createHabit(page);
  await page.getByRole('button', { name: 'Marcar' }).click();
  await expect(page.getByRole('button', { name: 'Hecho' })).toBeVisible();
  await expect(page.getByText('1 días', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('1/1', { exact: true })).toBeVisible();
});

test('5. permite conservar un hábito desde el modal de eliminación', async ({ page }) => {
  const habitName = 'Leer diez minutos';
  await registerFromUi(page);
  await createHabit(page, habitName);
  await page.getByRole('button', { name: `Eliminar ${habitName}` }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Conservar hábito' }).click();
  await expect(page.getByRole('heading', { name: habitName })).toBeVisible();
});

test('6. elimina un hábito al confirmar el modal', async ({ page }) => {
  const habitName = 'Caminar veinte minutos';
  await registerFromUi(page);
  await createHabit(page, habitName);
  await page.getByRole('button', { name: `Eliminar ${habitName}` }).click();
  await page.getByRole('button', { name: 'Sí, eliminar' }).click();
  await expect(page.getByText('Tu jardín espera su primera semilla')).toBeVisible();
  await expect(page.getByRole('heading', { name: habitName })).toHaveCount(0);
});
