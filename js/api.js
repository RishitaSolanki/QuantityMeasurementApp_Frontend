const BASE_URL = 'http://localhost:5212/api/v1';

const Api = {
  _headers() {
    const token = Auth.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  async post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errorMessage || 'Request failed');
    return data;
  },

  async postWithQuery(path, body, query) {
    const res = await fetch(`${BASE_URL}${path}?${new URLSearchParams(query)}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errorMessage || 'Request failed');
    return data;
  },

  // Auth
  register: (payload) => Api.post('/Auth/register', payload),
  login: (payload) => Api.post('/Auth/login', payload),

  // Measurement
  compare: (payload) => Api.post('/QuantityMeasurement/compare', payload),
  convert: (payload, targetUnit) => Api.postWithQuery('/QuantityMeasurement/convert', payload, { targetUnit }),
  add: (payload) => Api.post('/QuantityMeasurement/add', payload),
  subtract: (payload) => Api.post('/QuantityMeasurement/subtract', payload),
  divide: (payload) => Api.post('/QuantityMeasurement/divide', payload),
};
