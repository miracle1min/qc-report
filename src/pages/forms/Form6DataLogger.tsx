import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save, Plus, X } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps, SHIFT_OPTIONS } from '../../types';
import { genId, nowISO, reportFooter, copyText } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

const EQUIPMENT_LIST = [
  { key: 'chiller_dimsum', label: 'Chiller Dimsum', emoji: '🧊' },
  { key: 'chiller_noodle', label: 'Chiller Noodle', emoji: '🍜' },
  { key: 'chiller_bar', label: 'Chiller Bar', emoji: '🍹' },
  { key: 'chiller_produksi', label: 'Chiller Produksi', emoji: '⚙️' },
  { key: 'freezer_1', label: 'Freezer 1', emoji: '❄️' },
  { key: 'freezer_2', label: 'Freezer 2', emoji: '❄️' },
  { key: 'cold_storage', label: 'Cold Storage', emoji: '🏔️' },
] as const;

type EquipmentKey = typeof EQUIPMENT_LIST[number]['key'];

interface TempData {
  min: string;
  max: string;
  avg: string;
}

const emptyTemp = (): TempData => ({ min: '', max: '', avg: '' });

export const Form6DataLogger: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [shift, setShift] = useState('');
  const [temps, setTemps] = useState<Record<EquipmentKey, TempData>>(
    () => Object.fromEntries(EQUIPMENT_LIST.map(e => [e.key, emptyTemp()])) as Record<EquipmentKey, TempData>
  );
  const [keterangan, setKeterangan] = useState<string[]>(['']);
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setShift(d.shift || '');
        if (d.temps) setTemps(d.temps);
        setKeterangan(d.keterangan?.length ? d.keterangan : ['']);
        setOutput(r.generated_text || '');
        setRecordId(r.id);
      }
    }
  }, [editId]);

  const updateTemp = (key: EquipmentKey, field: keyof TempData, value: string) => {
    setTemps(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const addKet = () => setKeterangan(prev => [...prev, '']);
  const removeKet = (i: number) => setKeterangan(prev => prev.filter((_, idx) => idx !== i));
  const updateKet = (i: number, v: string) => setKeterangan(prev => prev.map((item, idx) => idx === i ? v : item));

  const generate = () => {
    if (!shift) { showToast('Pilih Shift dulu', 'error'); return; }

    const equipLines = EQUIPMENT_LIST.map(eq => {
      const t = temps[eq.key];
      const minVal = t.min || '-';
      const maxVal = t.max || '-';
      const avgVal = t.avg || '-';
      return `${eq.emoji} *${eq.label}*\nMin : ${minVal}°C\nMax : ${maxVal}°C\nAvg : ${avgVal}°C`;
    }).join('\n\n');

    const ketList = keterangan.filter(k => k.trim()).map(k => `• ${k}`).join('\n');

    const text = `*_SUHU DATA LOGGER (°C)_*\n\n🕐 Shift : ${shift}\n\n${equipLines}\n\n📝 Keterangan :\n${ketList || '• -'}\n${reportFooter()}`;

    setOutput(text);
    showToast('Report generated!', 'success');
  };

  const handleCopy = async () => {
    if (!output) { showToast('Generate report dulu', 'error'); return; }
    await copyText(output);
    showToast('Report copied successfully ✓', 'success');
  };

  const handleSave = () => {
    if (!output) { showToast('Generate report dulu', 'error'); return; }
    const id = recordId || genId();
    const data = JSON.stringify({ shift, temps, keterangan });
    saveReport({ id, type: 'suhu_datalogger', shift, data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Suhu Data Logger" onBack={onBack} subtitle="Chiller, Freezer & Cold Storage (°C)" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Shift */}
        <div>
          <label className="form-label">Shift</label>
          <select className="cyber-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">— Pilih Shift —</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Equipment Inputs */}
        {EQUIPMENT_LIST.map(eq => (
          <div key={eq.key} style={{
            background: 'rgba(0,255,255,0.03)',
            border: '1px solid rgba(0,255,255,0.15)',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <label className="form-label" style={{ fontSize: 15, marginBottom: 10 }}>
              {eq.emoji} {eq.label}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: '#8af', display: 'block', marginBottom: 4, fontWeight: 600 }}>Min (°C)</label>
                <input
                  className="cyber-input"
                  type="number"
                  step="0.1"
                  value={temps[eq.key].min}
                  onChange={e => updateTemp(eq.key, 'min', e.target.value)}
                  placeholder="0.0"
                  style={{ padding: '8px 8px', fontSize: 14, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#fa8', display: 'block', marginBottom: 4, fontWeight: 600 }}>Max (°C)</label>
                <input
                  className="cyber-input"
                  type="number"
                  step="0.1"
                  value={temps[eq.key].max}
                  onChange={e => updateTemp(eq.key, 'max', e.target.value)}
                  placeholder="0.0"
                  style={{ padding: '8px 8px', fontSize: 14, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#af8', display: 'block', marginBottom: 4, fontWeight: 600 }}>Avg (°C)</label>
                <input
                  className="cyber-input"
                  type="number"
                  step="0.1"
                  value={temps[eq.key].avg}
                  onChange={e => updateTemp(eq.key, 'avg', e.target.value)}
                  placeholder="0.0"
                  style={{ padding: '8px 8px', fontSize: 14, textAlign: 'center' }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Keterangan */}
        <div>
          <label className="form-label">Keterangan</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {keterangan.map((ket, i) => (
              <div key={i} className="ket-item">
                <span className="neon-text" style={{ fontSize: 14, fontWeight: 700 }}>•</span>
                <input
                  className="cyber-input"
                  style={{ flex: 1, padding: '8px 10px', fontSize: 14 }}
                  value={ket}
                  onChange={e => updateKet(i, e.target.value)}
                  placeholder="Keterangan..."
                />
                {keterangan.length > 1 && (
                  <button onClick={() => removeKet(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff3b30' }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="btn-neon btn-sm" onClick={addKet} style={{ marginTop: 8, width: 'auto', display: 'inline-flex' }}>
            <Plus size={16} /> Add Keterangan
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button className="btn-solid-neon" onClick={generate}><FileText size={18} /> Generate Report</button>
          <button className="btn-neon" onClick={handleCopy}><Copy size={18} /> Copy to WhatsApp</button>
          <button className="btn-accent" onClick={handleSave}><Save size={18} /> Save Record</button>
        </div>

        {/* Output */}
        {output && (
          <div style={{ marginTop: 8 }}>
            <label className="form-label">Generated Output</label>
            <div className="report-output">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
};
