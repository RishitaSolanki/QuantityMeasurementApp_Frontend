import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Calculator from '../components/Calculator';
import History from '../components/History';
import AuthModal from '../components/AuthModal';
import s from '../styles/App.module.css';

export default function AppPage() {
  const { user, isGuest, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [historyKey, setHistoryKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Redirect if not authenticated at all
  useEffect(() => {
    if (!isLoggedIn && !isGuest) navigate('/');
  }, [isLoggedIn, isGuest, navigate]);

  // Re-render history when cleared via event
  useEffect(() => {
    const handler = () => setHistoryKey(k => k + 1);
    window.addEventListener('historyCleared', handler);
    return () => window.removeEventListener('historyCleared', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleAuthSuccess() {
    setShowModal(false);
    setHistoryKey(k => k + 1);
  }

  return (
    <>
      <nav className={s.nav}>
        <div className={s.brand}><span>⚖️</span> Quantity Measurement</div>
        <div className={s.navRight}>
          <span className={s.navUser}>
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </span>
          <button className={s.btnOutline} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className={s.container}>
        {isGuest && (
          <div className={s.banner}>
            ⚠️ You're in guest mode. History is saved in session only.
            <button className={s.bannerLink} onClick={() => setShowModal(true)}>
              Login to save permanently →
            </button>
          </div>
        )}

        <Calculator onNewEntry={() => setHistoryKey(k => k + 1)} />
        <History refreshKey={historyKey} />
      </div>

      {showModal && <AuthModal onClose={handleAuthSuccess} />}
    </>
  );
}
