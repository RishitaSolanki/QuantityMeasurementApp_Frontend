import { useAuth } from '../context/AuthContext';
import { getHistory, clearHistory } from '../services/history';
import s from '../styles/App.module.css';

export default function History({ refreshKey }) {
  const { user, isGuest } = useAuth();
  const list = getHistory(user, isGuest);

  function handleClear() {
    clearHistory(user, isGuest);
    window.dispatchEvent(new Event('historyCleared'));
  }

  return (
    <div className={s.card}>
      <div className={s.historyHeader}>
        <div className={s.cardTitle} style={{ marginBottom: 0 }}>🕓 History</div>
        <button className={s.clearBtn} onClick={handleClear}>Clear</button>
      </div>

      {list.length === 0 ? (
        <p className={s.empty}>No history yet</p>
      ) : (
        <ul className={s.historyList}>
          {list.map((h, i) => (
            <li key={i} className={s.historyItem}>
              <div>
                <span className={s.historyOp}>{h.op} · {h.type.replace('Unit', '')}</span>
                <br />
                <span className={s.historyExpr}>{h.expr || '—'}</span>
              </div>
              <span className={s.historyResult}>{h.result ?? ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
