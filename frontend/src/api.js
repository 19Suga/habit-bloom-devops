const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('habit-bloom-session'));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (session) localStorage.setItem('habit-bloom-session', JSON.stringify(session));
  else localStorage.removeItem('habit-bloom-session');
}

export async function request(path, options = {}) {
  const session = getSession();
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba que el backend esté iniciado.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No fue posible completar la solicitud.');
  return data;
}
