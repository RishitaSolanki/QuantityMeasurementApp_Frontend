const UNITS = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'POUND'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT']
};

const OPS = ['ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE', 'CONVERT'];

let state = {
  type: 'LengthUnit',
  op: 'ADD'
};

// ── History (guest = sessionStorage, user = localStorage keyed by userId) ──
const History = {
  _key() {
    const user = Auth.getUser();
    return user ? `qm_history_${user.id}` : 'qm_history_guest';
  },
  _store() { return Auth.isGuest() ? sessionStorage : localStorage; },
  get() { return JSON.parse(this._store().getItem(this._key()) || '[]'); },
  add(entry) {
    const list = this.get();
    list.unshift({ ...entry, time: new Date().toLocaleTimeString() });
    if (list.length > 50) list.pop();
    this._store().setItem(this._key(), JSON.stringify(list));
    renderHistory();
  },
  clear() {
    this._store().removeItem(this._key());
    renderHistory();
  }
};

// ── Render unit dropdowns ──
function populateUnits() {
  const units = UNITS[state.type];
  ['unit1', 'unit2', 'targetUnit'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
  });
}

// ── Show/hide second input based on operation ──
function updateLayout() {
  const isConvert = state.op === 'CONVERT';
  const isSingle = isConvert;
  document.getElementById('normalInputs').style.display = isSingle ? 'none' : 'grid';
  document.getElementById('convertInputs').style.display = isSingle ? 'grid' : 'none';
  document.getElementById('resultBox').classList.remove('show', 'error');
}

// ── Perform operation ──
async function calculate() {
  const btn = document.getElementById('calcBtn');
  const resultBox = document.getElementById('resultBox');
  const resultVal = document.getElementById('resultValue');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Calculating...';
  resultBox.classList.remove('show', 'error');

  try {
    let result;
    const measurementType = state.type;

    if (state.op === 'CONVERT') {
      const firstValue = parseFloat(document.getElementById('convertVal').value);
      const firstUnit = document.getElementById('convertUnit').value;
      const targetUnit = document.getElementById('targetUnit').value;
      if (isNaN(firstValue)) throw new Error('Enter a valid number');
      const payload = { firstValue, firstUnit, secondValue: 0, secondUnit: targetUnit, operation: 'CONVERT', measurementType };
      result = await Api.convert(payload, targetUnit);
    } else {
      const firstValue = parseFloat(document.getElementById('val1').value);
      const firstUnit = document.getElementById('unit1').value;
      const secondValue = parseFloat(document.getElementById('val2').value);
      const secondUnit = document.getElementById('unit2').value;
      if (isNaN(firstValue) || isNaN(secondValue)) throw new Error('Enter valid numbers');
      const payload = { firstValue, firstUnit, secondValue, secondUnit, operation: state.op, measurementType };

      const opMap = { ADD: Api.add, SUBTRACT: Api.subtract, DIVIDE: Api.divide, COMPARE: Api.compare };
      result = await opMap[state.op].call(Api, payload);
    }

    resultBox.classList.add('show');
    resultVal.textContent = result.resultString || result.result;
    History.add({ op: state.op, type: state.type, expr: result.resultString || '', result: result.result });

  } catch (err) {
    resultBox.classList.add('show', 'error');
    resultVal.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Calculate';
  }
}

// ── Render history list ──
function renderHistory() {
  const list = History.get();
  const el = document.getElementById('historyList');
  if (!list.length) {
    el.innerHTML = '<p class="history-empty">No history yet</p>';
    return;
  }
  el.innerHTML = list.map(h => `
    <li class="history-item">
      <div>
        <span class="history-op">${h.op} · ${h.type.replace('Unit','')}</span><br>
        <span class="history-expr">${h.expr || '—'}</span>
      </div>
      <span class="history-result">${h.result ?? ''}</span>
    </li>
  `).join('');
}

// ── Init ──
function init() {
  Auth.requireAccess();

  // Nav user info
  const user = Auth.getUser();
  const navUser = document.getElementById('navUser');
  if (user) navUser.textContent = `${user.firstName} ${user.lastName}`;
  else navUser.textContent = 'Guest';

  // Guest banner
  if (Auth.isGuest()) {
    document.getElementById('guestBanner').style.display = 'flex';
  }

  // Type tabs
  const typeTabs = document.getElementById('typeTabs');
  Object.keys(UNITS).forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'type-tab' + (type === state.type ? ' active' : '');
    btn.textContent = type.replace('Unit', '');
    btn.onclick = () => {
      state.type = type;
      typeTabs.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      populateUnits();
      document.getElementById('resultBox').classList.remove('show', 'error');
    };
    typeTabs.appendChild(btn);
  });

  // Op tabs
  const opTabs = document.getElementById('opTabs');
  OPS.forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'op-tab' + (op === state.op ? ' active' : '');
    btn.textContent = op;
    btn.onclick = () => {
      state.op = op;
      opTabs.querySelectorAll('.op-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateLayout();
    };
    opTabs.appendChild(btn);
  });

  populateUnits();
  updateLayout();
  renderHistory();

  document.getElementById('calcBtn').addEventListener('click', calculate);
  document.getElementById('clearHistoryBtn').addEventListener('click', () => History.clear());
  document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
  document.getElementById('loginFromBanner').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', init);
