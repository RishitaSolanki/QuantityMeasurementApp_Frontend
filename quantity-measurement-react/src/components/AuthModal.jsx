import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import s from '../styles/AuthModal.module.css';

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', error: false });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '' });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', error: false });
    try {
      const data = await authApi.login(loginForm);
      login(data);
      onClose();
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', error: false });
    try {
      const data = await authApi.register(regForm);
      login(data);
      onClose();
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally { setLoading(false); }
  }

  return (
    <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <button className={s.close} onClick={onClose}>✕</button>
        <h2>Welcome</h2>

        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'login' ? s.active : ''}`} onClick={() => { setTab('login'); setMsg({ text: '', error: false }); }}>Login</button>
          <button className={`${s.tab} ${tab === 'register' ? s.active : ''}`} onClick={() => { setTab('register'); setMsg({ text: '', error: false }); }}>Register</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className={s.group}>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" required value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className={s.group}>
              <label>Password</label>
              <input type="password" placeholder="••••••••" required value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            {msg.text && <p className={msg.error ? s.error : s.success}>{msg.text}</p>}
            <button className={s.btn} disabled={loading}>
              {loading && <span className={s.spinner} />}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className={s.row}>
              <div className={s.group}>
                <label>First Name</label>
                <input type="text" placeholder="John" required value={regForm.firstName} onChange={e => setRegForm(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className={s.group}>
                <label>Last Name</label>
                <input type="text" placeholder="Doe" required value={regForm.lastName} onChange={e => setRegForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className={s.group}>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" required value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className={s.group}>
              <label>Password <small style={{ color: '#888' }}>(min 6 chars)</small></label>
              <input type="password" placeholder="••••••••" required minLength={6} value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            {msg.text && <p className={msg.error ? s.error : s.success}>{msg.text}</p>}
            <button className={s.btn} disabled={loading}>
              {loading && <span className={s.spinner} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
