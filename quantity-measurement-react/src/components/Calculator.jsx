import { useState, useEffect } from 'react';
import { measureApi } from '../services/api';
import { addHistory } from '../services/history';
import { useAuth } from '../context/AuthContext';
import s from '../styles/App.module.css';

const UNITS = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'POUND'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT'],
};

const OPS = ['ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE', 'CONVERT'];
const OP_SYMBOLS = { ADD: '+', SUBTRACT: '−', DIVIDE: '÷', COMPARE: '=?', CONVERT: '→' };

export default function Calculator({ onNewEntry }) {
  const { user, isGuest } = useAuth();

  const [type, setType]           = useState('LengthUnit');
  const [op, setOp]               = useState('ADD');
  const [val1, setVal1]           = useState('');
  const [unit1, setUnit1]         = useState('FEET');
  const [val2, setVal2]           = useState('');
  const [unit2, setUnit2]         = useState('FEET');
  const [targetUnit, setTargetUnit] = useState('INCHES');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  // Reset units whenever measurement type changes
  useEffect(() => {
    const units = UNITS[type];
    setUnit1(units[0]);
    setUnit2(units[0]);
    setTargetUnit(units[1] ?? units[0]);
    setResult(null);
    setVal1('');
    setVal2('');
  }, [type]);

  useEffect(() => { setResult(null); }, [op]);

  async function calculate() {
    // Basic validation
    if (!val1 || isNaN(parseFloat(val1))) {
      setResult({ text: 'Please enter a valid first value.', isError: true });
      return;
    }
    if (op !== 'CONVERT' && (!val2 || isNaN(parseFloat(val2)))) {
      setResult({ text: 'Please enter a valid second value.', isError: true });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data;

      switch (op) {
        case 'ADD':
          data = await measureApi.add(type, val1, unit1, val2, unit2);
          break;
        case 'SUBTRACT':
          data = await measureApi.subtract(type, val1, unit1, val2, unit2);
          break;
        case 'DIVIDE':
          data = await measureApi.divide(type, val1, unit1, val2, unit2);
          break;
        case 'COMPARE':
          data = await measureApi.compare(type, val1, unit1, val2, unit2);
          break;
        case 'CONVERT':
          data = await measureApi.convert(type, val1, unit1, targetUnit);
          break;
        default:
          throw new Error('Unknown operation');
      }

      // ASP.NET Core serializes PascalCase → camelCase: resultString, result
      const displayText = data.resultString || String(data.result);
      setResult({ text: displayText, isError: false });

      addHistory({ op, type, expr: displayText, result: data.result }, user, isGuest);
      onNewEntry();

    } catch (err) {
      setResult({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  }

  const units = UNITS[type];
  const isConvert = op === 'CONVERT';

  return (
    <div className={s.card}>
      <div className={s.cardTitle}>📐 Measurement Calculator</div>

      {/* Measurement type tabs */}
      <div className={s.typeTabs}>
        {Object.keys(UNITS).map(t => (
          <button
            key={t}
            className={`${s.typeTab} ${type === t ? s.active : ''}`}
            onClick={() => setType(t)}
          >
            {t.replace('Unit', '')}
          </button>
        ))}
      </div>

      {/* Operation tabs */}
      <div className={s.opTabs}>
        {OPS.map(o => (
          <button
            key={o}
            className={`${s.opTab} ${op === o ? s.active : ''}`}
            onClick={() => setOp(o)}
          >
            {o}
          </button>
        ))}
      </div>

      {/* CONVERT layout */}
      {isConvert ? (
        <div className={s.convertGrid}>
          <div>
            <div className={s.group}>
              <label>Value</label>
              <input
                type="number" step="any" placeholder="e.g. 100"
                value={val1} onChange={e => setVal1(e.target.value)}
              />
            </div>
            <div className={s.group}>
              <label>From Unit</label>
              <select value={unit1} onChange={e => setUnit1(e.target.value)}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className={s.symbol}>→</div>
          <div style={{ paddingTop: '1.6rem' }}>
            <div className={s.group}>
              <label>To Unit</label>
              <select value={targetUnit} onChange={e => setTargetUnit(e.target.value)}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Two-value layout for ADD / SUBTRACT / DIVIDE / COMPARE */
        <div className={s.inputGrid}>
          <div>
            <div className={s.group}>
              <label>Value 1</label>
              <input
                type="number" step="any" placeholder="e.g. 10"
                value={val1} onChange={e => setVal1(e.target.value)}
              />
            </div>
            <div className={s.group}>
              <label>Unit 1</label>
              <select value={unit1} onChange={e => setUnit1(e.target.value)}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className={s.symbol}>{OP_SYMBOLS[op]}</div>

          <div>
            <div className={s.group}>
              <label>Value 2</label>
              <input
                type="number" step="any" placeholder="e.g. 5"
                value={val2} onChange={e => setVal2(e.target.value)}
              />
            </div>
            <div className={s.group}>
              <label>Unit 2</label>
              <select value={unit2} onChange={e => setUnit2(e.target.value)}>
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <button className={s.calcBtn} onClick={calculate} disabled={loading}>
        {loading && <span className={s.spinner} />}
        {loading ? 'Calculating...' : 'Calculate'}
      </button>

      {result && (
        <div className={`${s.result} ${result.isError ? s.resultError : ''}`}>
          <div className={s.resultLabel}>Result</div>
          <div className={s.resultValue}>{result.text}</div>
        </div>
      )}
    </div>
  );
}
