const BASE = 'https://quantitymeasurementapp-igyb.onrender.com';

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
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    // If response is not JSON, use text
    data = { message: text };
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
  login:    (body) => request('/api/Auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/Auth/signup',   { method: 'POST', body: JSON.stringify(body) }),
};

// ── Measurement ───────────────────────────────────────────────────────────────
// Backend expects: { ThisQuantityDTO: {Value, Unit, MeasurementType}, ThatQuantityDTO: {Value, Unit, MeasurementType} }

function buildQuantityDTO(value, unit, measurementType) {
  return {
    Value: parseFloat(value),
    Unit: unit,
    MeasurementType: measurementType,
  };
}

export const measureApi = {
  add(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/api/v1/quantities/add', {
      method: 'POST',
      body: JSON.stringify({
        ThisQuantityDTO: buildQuantityDTO(firstValue, firstUnit, measurementType),
        ThatQuantityDTO: buildQuantityDTO(secondValue, secondUnit, measurementType),
      }),
    });
  },

  subtract(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/api/v1/quantities/subtract', {
      method: 'POST',
      body: JSON.stringify({
        ThisQuantityDTO: buildQuantityDTO(firstValue, firstUnit, measurementType),
        ThatQuantityDTO: buildQuantityDTO(secondValue, secondUnit, measurementType),
      }),
    });
  },

  divide(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/api/v1/quantities/divide', {
      method: 'POST',
      body: JSON.stringify({
        ThisQuantityDTO: buildQuantityDTO(firstValue, firstUnit, measurementType),
        ThatQuantityDTO: buildQuantityDTO(secondValue, secondUnit, measurementType),
      }),
    });
  },

  compare(measurementType, firstValue, firstUnit, secondValue, secondUnit) {
    return request('/api/v1/quantities/compare', {
      method: 'POST',
      body: JSON.stringify({
        ThisQuantityDTO: buildQuantityDTO(firstValue, firstUnit, measurementType),
        ThatQuantityDTO: buildQuantityDTO(secondValue, secondUnit, measurementType),
      }),
    });
  },

  convert(measurementType, firstValue, firstUnit, targetUnit) {
    return request('/api/v1/quantities/convert', {
      method: 'POST',
      body: JSON.stringify({
        QuantityDTO: buildQuantityDTO(firstValue, firstUnit, measurementType),
        TargetUnit: targetUnit,
      }),
    });
  },
};
