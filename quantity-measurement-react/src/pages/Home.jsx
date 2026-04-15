import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import s from '../styles/Home.module.css';

export default function Home() {
  const { continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  function handleGuest() {
    continueAsGuest();
    navigate('/app');
  }

  function handleAuthSuccess() {
    setShowModal(false);
    navigate('/app');
  }

  return (
    <>
      <div className={s.hero}>
        <h1>⚖️ Quantity Measurement</h1>
        <p>Convert, compare &amp; calculate Length, Weight, Volume and Temperature</p>
        <div className={s.cards}>
          <button className={s.card} onClick={handleGuest}>
            <div className={s.icon}>🚀</div>
            <h3>Continue as Guest</h3>
            <p>Use the app instantly. History saved in browser session.</p>
            <span className={`${s.badge} ${s.badgeGuest}`}>Session Storage</span>
          </button>
          <button className={s.card} onClick={() => setShowModal(true)}>
            <div className={s.icon}>🔐</div>
            <h3>Login / Register</h3>
            <p>Save your history permanently and access from anywhere.</p>
            <span className={`${s.badge} ${s.badgeAuth}`}>Database Backed</span>
          </button>
        </div>
      </div>

      {showModal && <AuthModal onClose={handleAuthSuccess} />}
    </>
  );
}
