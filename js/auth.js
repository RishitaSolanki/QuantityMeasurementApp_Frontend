const Auth = {
  getToken: () => localStorage.getItem('qm_token'),
  getUser: () => JSON.parse(localStorage.getItem('qm_user') || 'null'),
  isGuest: () => sessionStorage.getItem('qm_guest') === 'true',
  isLoggedIn: () => !!localStorage.getItem('qm_token'),

  setSession(data) {
    localStorage.setItem('qm_token', data.token);
    localStorage.setItem('qm_user', JSON.stringify(data.user));
    sessionStorage.removeItem('qm_guest');
  },

  setGuest() {
    sessionStorage.setItem('qm_guest', 'true');
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
  },

  logout() {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    sessionStorage.removeItem('qm_guest');
    window.location.href = 'index.html';
  },

  requireAccess() {
    if (!this.isLoggedIn() && !this.isGuest()) {
      window.location.href = 'index.html';
    }
  }
};
