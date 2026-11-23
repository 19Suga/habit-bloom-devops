import { useEffect, useMemo, useRef, useState } from 'react';
import { getSession, request, saveSession } from './api.js';

const categoryIcons = { agua: '💧', movimiento: '🌿', estudio: '✎', lectura: '☾', bienestar: '✿' };
const categories = [
  { value: 'agua', label: 'Agua' },
  { value: 'movimiento', label: 'Movimiento' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'lectura', label: 'Lectura' },
  { value: 'bienestar', label: 'Bienestar' }
];
const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function Logo() {
  return <div className="brand"><span>✿</span><strong>Habit Bloom</strong></div>;
}

function CategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const optionsRef = useRef([]);
  const selectedIndex = categories.findIndex((category) => category.value === value);
  const selected = categories[selectedIndex] || categories[0];

  useEffect(() => {
    if (open) optionsRef.current[selectedIndex]?.focus();
  }, [open, selectedIndex]);

  function choose(category) {
    onChange(category.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveFocus(index) {
    optionsRef.current[(index + categories.length) % categories.length]?.focus();
  }

  return <div className="category-select">
    <button
      ref={triggerRef}
      className={`category-trigger ${open ? 'is-open' : ''}`}
      type="button"
      aria-label={`Categoría: ${selected.label}`}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="habit-category-options"
      onClick={() => setOpen(!open)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!open) setOpen(true);
          else moveFocus(selectedIndex + (event.key === 'ArrowDown' ? 1 : -1));
        } else if (event.key === 'Escape') {
          setOpen(false);
        }
      }}
    >
      <span>{categoryIcons[selected.value]} {selected.label}</span><i aria-hidden="true">⌄</i>
    </button>
    {open && <div className="category-options" id="habit-category-options" role="listbox" aria-label="Categoría">
      {categories.map((category, index) => <button
        key={category.value}
        ref={(element) => { optionsRef.current[index] = element; }}
        type="button"
        role="option"
        aria-selected={value === category.value}
        tabIndex={-1}
        onClick={() => choose(category)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(index + 1); }
          else if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(index - 1); }
          else if (event.key === 'Home') { event.preventDefault(); moveFocus(0); }
          else if (event.key === 'End') { event.preventDefault(); moveFocus(categories.length - 1); }
          else if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
          else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(category); }
        }}
      ><span>{categoryIcons[category.value]} {category.label}</span>{value === category.value && <i aria-hidden="true">✓</i>}</button>)}
    </div>}
  </div>;
}

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const session = await request(path, { method: 'POST', body: JSON.stringify(form) });
      saveSession(session);
      onAuthenticated(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page">
    <header><Logo /></header>
    <section className="auth-card">
      <div className="auth-story">
        <span className="eyebrow">Pequeños pasos, grandes cambios</span>
        <h1>{mode === 'login' ? 'Haz florecer la versión de ti que estás construyendo.' : 'Diseña días que se parezcan a la vida que deseas.'}</h1>
        <p>Un espacio bonito y sencillo para cuidar tus hábitos, celebrar tu constancia y ver crecer tus rachas.</p>
        <blockquote>✦ La constancia también puede sentirse suave.</blockquote>
      </div>
      <div className="auth-form">
        <span className="mini-mark">✿</span>
        <h2>{mode === 'login' ? 'Qué gusto verte' : 'Crea tu espacio'}</h2>
        <p>{mode === 'login' ? 'Continúa cuidando tu jardín de hábitos.' : 'Solo necesitas un minuto para comenzar.'}</p>
        {error && <div className="message error">{error}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && <label>Tu nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength="80" required /></label>}
          <label>Correo electrónico<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" required /></label>
          <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="6" placeholder="Mínimo 6 caracteres" required /></label>
          <button className="primary" disabled={loading}>{loading ? 'Un momento…' : mode === 'login' ? 'Entrar a mi espacio' : 'Crear mi jardín'}</button>
        </form>
        <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? '¿Primera vez aquí? Crea tu cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </section>
  </main>;
}

function HabitForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', category: 'bienestar', color: 'rose' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      const result = await request('/habits', { method: 'POST', body: JSON.stringify(form) });
      onCreated(result.message);
    } catch (err) { setError(err.message); }
  }

  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="habit-title">
      <button className="close" onClick={onClose} aria-label="Cerrar">×</button>
      <span className="eyebrow">Una nueva intención</span><h2 id="habit-title">Añadir hábito</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={submit}>
        <label>Nombre del hábito<input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Beber 8 vasos de agua" maxLength="80" required /></label>
        <label>Categoría<CategoryDropdown value={form.category} onChange={(category) => setForm({ ...form, category })} /></label>
        <fieldset><legend>Color</legend><div className="colors">{['rose', 'lavender', 'sage', 'peach'].map((color) => <label className={`color ${color}`} key={color}><input type="radio" name="color" checked={form.color === color} onChange={() => setForm({ ...form, color })} /><span /></label>)}</div></fieldset>
        <div className="modal-actions"><button type="button" className="soft" onClick={onClose}>Cancelar</button><button className="primary">Guardar hábito</button></div>
      </form>
    </div>
  </div>;
}

function Dashboard({ session, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [today, setToday] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    try {
      const result = await request('/habits');
      setHabits(result.habits); setToday(result.today);
    } catch (error) {
      if (error.message.includes('sesión')) onLogout();
      else setNotice(error.message);
    }
  }
  useEffect(() => { load(); }, []);

  const todayDone = habits.filter((habit) => habit.doneToday).length;
  const weeklyPercent = useMemo(() => {
    const completed = habits.reduce((total, habit) => total + habit.week.filter((day) => day.completed).length, 0);
    return habits.length ? Math.round((completed / (habits.length * 7)) * 100) : 0;
  }, [habits]);

  async function toggle(id) { const result = await request(`/habits/${id}/today`, { method: 'POST' }); setNotice(result.message); await load(); }
  async function remove(habit) {
    setDeletingHabit(habit);
    setDeleteError('');
  }
  async function confirmRemove() {
    if (!deletingHabit || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const result = await request(`/habits/${deletingHabit.id}`, { method: 'DELETE' });
      setDeletingHabit(null);
      setNotice(result.message);
      await load();
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  const friendlyDate = today ? new Date(`${today}T12:00:00`).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  return <main className="dashboard">
    <header><Logo /><div className="user"><span>Hola, {session.user.name.split(' ')[0]}</span><button className="soft" onClick={onLogout}>Cerrar sesión</button></div></header>
    <div className="page">
      {notice && <div className="message success" onClick={() => setNotice('')}>{notice}<span>×</span></div>}
      <section className="hero"><div><span className="eyebrow">{friendlyDate}</span><h1>Tu jardín de hoy</h1><p>{habits.length && todayDone === habits.length ? 'Todo listo por hoy. Regálate un momento para celebrarlo.' : 'Elige un hábito y da el primer paso de hoy.'}</p></div><button className="primary" onClick={() => setShowForm(true)}>Añadir hábito</button></section>
      <section className="summary">
        <article><i className="rose">✿</i><div><strong>{habits.length}</strong><span>hábitos activos</span></div></article>
        <article><i className="lavender">✓</i><div><strong>{todayDone}/{habits.length}</strong><span>completados hoy</span></div></article>
        <article><i className="ring" style={{ '--progress': `${weeklyPercent * 3.6}deg` }}>{weeklyPercent}%</i><div><strong>Esta semana</strong><span>avance de tus hábitos</span></div></article>
      </section>
      {habits.length ? <><div className="section-title"><div><span className="eyebrow">Constancia cotidiana</span><h2>Mis hábitos</h2></div><em>Un día a la vez</em></div><section className="habit-grid">{habits.map((habit) => <article className={`habit-card ${habit.color}`} key={habit.id}>
        <div className="habit-top"><i>{categoryIcons[habit.category]}</i><div><span>{habit.category}</span><h3>{habit.name}</h3></div><button className={`check ${habit.doneToday ? 'done' : ''}`} onClick={() => toggle(habit.id)}><b>{habit.doneToday ? '✓' : '+'}</b><small>{habit.doneToday ? 'Hecho' : 'Marcar'}</small></button></div>
        <div className="week">{habit.week.map((item) => { const date = new Date(`${item.day}T12:00:00`); return <div className={item.completed ? 'completed' : ''} key={item.day}><span>{dayNames[date.getDay()]}</span><i>{item.completed ? '✓' : date.getDate()}</i></div>; })}</div>
        <div className="habit-bottom"><div>🔥 <span><strong>{habit.currentStreak} días</strong><small>racha actual</small></span></div><div>🏆 <span><strong>{habit.bestStreak} días</strong><small>mejor racha</small></span></div><button className="dots" onClick={() => remove(habit)} aria-label={`Eliminar ${habit.name}`}>⋯</button></div>
      </article>)}</section></> : <section className="empty"><div>✿</div><span className="eyebrow">Un espacio para comenzar</span><h2>Tu jardín espera su primera semilla</h2><p>Empieza con algo amable y alcanzable: tomar agua, leer diez minutos o salir a caminar.</p><button className="primary" onClick={() => setShowForm(true)}>Crear mi primer hábito</button></section>}
    </div>
    {showForm && <HabitForm onClose={() => setShowForm(false)} onCreated={async (message) => { setShowForm(false); setNotice(message); await load(); }} />}
    {deletingHabit && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !deleting && setDeletingHabit(null)}>
      <section className="modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" onKeyDown={(event) => event.key === 'Escape' && !deleting && setDeletingHabit(null)}>
        <button className="close" type="button" onClick={() => setDeletingHabit(null)} aria-label="Cerrar" disabled={deleting}>×</button>
        <span className="delete-mark" aria-hidden="true">✿</span>
        <span className="eyebrow">Una pausa para decidir</span>
        <h2 id="delete-title">¿Dejar ir este hábito?</h2>
        <p id="delete-description">Vas a eliminar <strong>“{deletingHabit.name}”</strong> y todo su historial. Esta acción no se puede deshacer.</p>
        {deleteError && <div className="message error">{deleteError}</div>}
        <div className="modal-actions">
          <button type="button" className="soft" onClick={() => setDeletingHabit(null)} disabled={deleting}>Conservar hábito</button>
          <button type="button" className="danger" onClick={confirmRemove} disabled={deleting}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button>
        </div>
      </section>
    </div>}
  </main>;
}

export default function App() {
  const [session, setSession] = useState(getSession());
  function logout() { saveSession(null); setSession(null); }
  return session ? <Dashboard session={session} onLogout={logout} /> : <Auth onAuthenticated={setSession} />;
}
