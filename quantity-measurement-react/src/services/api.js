const BASE = 'https://quantitymeasurementapp-igyb.onrender.com/api/v1';

function getToken() {
  return localStorage.getItem('qm_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    // GlobalExceptionHandlingMiddleware returns { message, error, timestamp, path }
    // AuthController returns { error: "..." }
    // Operation controllers return { errorMessage: "..." }
    throw new Error(
      data?.message || data?.error || data?.errorMessage || data?.title || `Request failed (${res.status})`
    );
  }

  // Backend operation errors come back as 200 OK with isError: true
  if (data?.isError) {
    throw new Error(data.errorMessage || data.message || 'Operation failed');
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (body) => request('/Auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/Auth/register', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Measurement ───────────────────────────────────────────────────────────────
// All endpoints expect: { firstValue, firstUnit, secondValue, secondUnit, operation, measurementType }
// CONVERT also needs ?targetUnit= query param

function buildPayload(op, measurementType, firstValue, firstUnit, secondValue, secondUnit) {
  return {
    firstValue:      parseFloat(firstValue),
    firstUnit:       firstUnit,
    secondValue:     parseFloat(secondValue) || 0,
    secondUnit:      secondUnit,
    operation:       op,
    measurementType: measurementType,
  };
}

export const measureApi = {
  add(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/QuantityMeasurement/add', {
      method: 'POST',
      body: JSON.stringify(buildPayload('ADD', measurementType, firstValue, firstUnit, secondValue, secondUnit)),
    });
  },

  subtract(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/QuantityMeasurement/subtract', {
      method: 'POST',
      body: JSON.stringify(buildPayload('SUBTRACT', measurementType, firstValue, firstUnit, secondValue, secondUnit)),
    });
  },

  divide(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/QuantityMeasurement/divide', {
      method: 'POST',
      body: JSON.stringify(buildPayload('DIVIDE', measurementType, firstValue, firstUnit, secondValue, secondUnit)),
    });
  },

  compare(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/QuantityMeasurement/compare', {
      method: 'POST',
      body: JSON.stringify(buildPayload('COMPARE', measurementType, firstValue, firstUnit, secondValue, secondUnit)),
    });
  },

  // CONVERT: secondUnit must be a valid unit (use targetUnit), targetUnit also sent as query param
  convert(measurementType, firstValue, firstUnit, targetUnit) {
    const payload = buildPayload('CONVERT', measurementType, firstValue, firstUnit, 0, targetUnit);
    return request(`/QuantityMeasurement/convert?targetUnit=${encodeURIComponent(targetUnit)}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
