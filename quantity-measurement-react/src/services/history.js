const MAX = 50;

function getKey(user) {
  return user ? `qm_history_${user.id}` : 'qm_history_guest';
}

function getStore(isGuest) {
  return isGuest ? sessionStorage : localStorage;
}

export function getHistory(user, isGuest) {
  return JSON.parse(getStore(isGuest).getItem(getKey(user)) || '[]');
}

export function addHistory(entry, user, isGuest) {
  const store = getStore(isGuest);
  const key = getKey(user);
  const list = JSON.parse(store.getItem(key) || '[]');
  list.unshift({ ...entry, time: new Date().toLocaleTimeString() });
  if (list.length > MAX) list.pop();
  store.setItem(key, JSON.stringify(list));
}

export function clearHistory(user, isGuest) {
  getStore(isGuest).removeItem(getKey(user));
}
