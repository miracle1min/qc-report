import React, { useState, useEffect } from 'react';
import { FileText, Copy, Save, Plus, X } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { FormProps, SHIFT_OPTIONS } from '../../types';
import { genId, nowISO, reportFooter, copyText } from '../../utils/helpers';
import { getReportById, saveReport } from '../../utils/db';

export const Form3Suhu: React.FC<FormProps> = ({ onBack, showToast, editId }) => {
  const [shift, setShift] = useState('');
  const [fryer, setFryer] = useState('');
  const [boiler, setBoiler] = useState('');
  const [griddle, setGriddle] = useState('');
  const [kompor, setKompor] = useState('');
  const [keterangan, setKeterangan] = useState<string[]>(['']);
  const [output, setOutput] = useState('');
  const [recordId, setRecordId] = useState('');

  useEffect(() => {
    if (editId) {
      const r = getReportById(editId);
      if (r) {
        const d = JSON.parse(r.data);
        setShift(d.shift || ''); setFryer(d.fryer || ''); setBoiler(d.boiler || '');
        setGriddle(d.griddle || ''); setKompor(d.kompor || '');
        setKeterangan(d.keterangan?.length ? d.keterangan : ['']);
        setOutput(r.generated_text || ''); setRecordId(r.id);
      }
    }
  }, [editId]);

  const addKet = () => setKeterangan(prev => [...prev, '']);
  const removeKet = (i: number) => setKeterangan(prev => prev.filter((_, idx) => idx !== i));
  const updateKet = (i: number, v: string) => setKeterangan(prev => prev.map((item, idx) => idx === i ? v : item));

  const generate = () => {
    if (!shift) { showToast('Pilih Shift dulu', 'error'); return; }
    const ketList = keterangan.filter(k => k.trim()).map(k => `• ${k}`).join('\n');
    const text = `*_SUHU ALL EQUIPMENTS (°C)_*\n\n🕐 Shift : ${shift}\n🍳 Fryer Dimsum : ${fryer || '-'}°C\n♨️ Boiler : ${boiler || '-'}°C\n🔥 Griddle : ${griddle || '-'}°C\n🍲 Kompor Produksi : ${kompor || '-'}°C\n\n📝 Keterangan :\n${ketList || '• -'}\n${reportFooter()}`;
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
    const data = JSON.stringify({ shift, fryer, boiler, griddle, kompor, keterangan });
    saveReport({ id, type: 'suhu_equipment', shift, data, generated_text: output, created_at: recordId ? '' : nowISO() });
    if (!recordId) setRecordId(id);
    showToast('Record saved ✓', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Suhu Equipment" onBack={onBack} subtitle="All Equipments (°C)" />
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Shift</label>
          <select className="cyber-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">— Pilih Shift —</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div><label className="form-label">Fryer Dimsum (°C)</label>
          <input className="cyber-input" type="number" value={fryer} onChange={e => setFryer(e.target.value)} placeholder="0" /></div>
        <div><label className="form-label">Boiler (°C)</label>
          <input className="cyber-input" type="number" value={boiler} onChange={e => setBoiler(e.target.value)} placeholder="0" /></div>
        <div><label className="form-label">Griddle (°C)</label>
          <input className="cyber-input" type="number" value={griddle} onChange={e => setGriddle(e.target.value)} placeholder="0" /></div>
        <div><label className="form-label">Kompor Produksi (°C)</label>
          <input className="cyber-input" type="number" value={kompor} onChange={e => setKompor(e.target.value)} placeholder="0" /></div>
        <div>
          <label className="form-label">Keterangan</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {keterangan.map((ket, i) => (
              <div key={i} className="ket-item">
                <span className="neon-text" style={{ fontSize: 14, fontWeight: 700 }}>•</span>
                <input className="cyber-input" style={{ flex: 1, padding: '8px 10px', fontSize: 14 }} value={ket} onChange={e => updateKet(i, e.target.value)} placeholder="Keterangan..." />
                {keterangan.length > 1 && (
                  <button onClick={() => removeKet(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ff3b30' }}><X size={18} /></button>
                )}
              </div>
            ))}
          </div>
          <button className="btn-neon btn-sm" onClick={addKet} style={{ marginTop: 8, width: 'auto', display: 'inline-flex' }}>
            <Plus size={16} /> Add Keterangan
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button className="btn-solid-neon" onClick={generate}><FileText size={18} /> Generate Report</button>
          <button className="btn-neon" onClick={handleCopy}><Copy size={18} /> Copy to WhatsApp</button>
          <button className="btn-accent" onClick={handleSave}><Save size={18} /> Save Record</button>
        </div>
        {output && (<div style={{ marginTop: 8 }}><label className="form-label">Generated Output</label><div className="report-output">{output}</div></div>)}
      </div>
    </div>
  );
};
